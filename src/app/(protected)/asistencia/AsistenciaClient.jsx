// src/app/(protected)/asistencia/AsistenciaClient.jsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { toCsv, download } from "@/lib/csvUtils";

const ATTENDANCE_STATUS = ['Presente', 'Ausente', 'Justificado'];

export default function AsistenciaClient() {
  const [asistencia, setAsistencia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  // Cargar datos reales
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/attendance"); // Trae los últimos 100
      if (res.ok) {
        setAsistencia(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Manejo de cambio de estado (PUT)
  const handleStatusChange = async (id, newStatus) => {
    // Optimistic UI update
    const original = [...asistencia];
    setAsistencia(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));

    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error("Falló la actualización");

    } catch (e) {
      alert("Error al actualizar estado");
      setAsistencia(original); // Revertir si falla
    }
  };

  const filteredList = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return asistencia;
    return asistencia.filter(a =>
      a.trabajador?.nombre.toLowerCase().includes(f) ||
      a.trabajador?.rut.toLowerCase().includes(f) ||
      a.servicio?.turno.toLowerCase().includes(f)
    );
  }, [asistencia, filter]);

  const handleExport = () => {
    // Aplanar datos para el CSV
    const flatData = filteredList.map(a => ({
      Fecha: new Date(a.servicio?.fecha).toLocaleDateString(),
      Turno: a.servicio?.turno,
      RUT: a.trabajador?.rut,
      Nombre: a.trabajador?.nombre,
      Estado: a.status,
      CheckIn: a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "-"
    }));
    const filename = `asistencia_${new Date().toISOString().split('T')[0]}.csv`;
    download(filename, toCsv(flatData));
  };

  return (
    <div className="mx-auto max-w-[1600px] p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Control de Asistencia</h1>
          <p className="text-slate-500 mt-1">Monitoreo en tiempo real de la asistencia del personal.</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-[1.02] transition-all"
        >
          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Exportar CSV
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <input
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar por nombre, RUT o turno..."
          className="w-full md:w-96 rounded-xl border-0 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <svg className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      {/* Tabla Desktop */}
      <div className="hidden md:block rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-50/80 backdrop-blur border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha / Turno</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trabajador</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Check-In</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400">Cargando asistencia...</td></tr>}
              {!loading && filteredList.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400">No hay registros recientes.</td></tr>
              )}

              {filteredList.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{new Date(item.servicio?.fecha).toLocaleDateString()}</div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">{item.servicio?.turno}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{item.trabajador?.nombre}</div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">{item.trabajador?.rut}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">
                    {item.checkIn ? (
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="text-slate-400">---</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className={`appearance-none cursor-pointer rounded-full pl-4 pr-8 py-1.5 text-xs font-bold border-0 ring-1 ring-inset focus:ring-2 focus:ring-blue-500 outline-none transition-all
                          ${item.status === 'Presente' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 hover:bg-emerald-100' :
                            item.status === 'Ausente' ? 'bg-red-50 text-red-700 ring-red-600/20 hover:bg-red-100' :
                              'bg-amber-50 text-amber-700 ring-amber-600/20 hover:bg-amber-100'}`}
                      >
                        {ATTENDANCE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <svg className={`h-3 w-3 ${item.status === 'Presente' ? 'text-emerald-700' : item.status === 'Ausente' ? 'text-red-700' : 'text-amber-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards Mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading && <p className="text-center text-slate-400 py-8">Cargando...</p>}
        {!loading && filteredList.length === 0 && <p className="text-center text-slate-400 py-8">Sin registros.</p>}

        {filteredList.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{item.trabajador?.nombre}</h3>
                <p className="text-sm font-mono text-slate-500">{item.trabajador?.rut}</p>
              </div>
              <div className="text-right">
                <div className="font-medium text-slate-900">{new Date(item.servicio?.fecha).toLocaleDateString()}</div>
                <div className="text-xs text-slate-500">{item.servicio?.turno}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {item.checkIn ? new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Sin marca"}
              </div>

              <div className="relative">
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  className={`appearance-none cursor-pointer rounded-xl pl-4 pr-10 py-2 text-sm font-bold border-0 ring-1 ring-inset focus:ring-2 focus:ring-blue-500 outline-none transition-all
                    ${item.status === 'Presente' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                      item.status === 'Ausente' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                        'bg-amber-50 text-amber-700 ring-amber-600/20'}`}
                >
                  {ATTENDANCE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                  <svg className={`h-4 w-4 ${item.status === 'Presente' ? 'text-emerald-700' : item.status === 'Ausente' ? 'text-red-700' : 'text-amber-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}