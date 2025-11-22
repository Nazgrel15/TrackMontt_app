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
    <div className="mx-auto grid max-w-6xl gap-6 text-black">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-black">Control de Asistencia</h1>
        <button onClick={handleExport} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          Exportar CSV
        </button>
      </div>
      
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <input
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar por nombre, RUT o turno..."
            className="w-72 max-w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 outline-none"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-50 text-gray-500">
              <tr>
                <th className="px-4 py-3">Fecha / Turno</th>
                <th className="px-4 py-3">Trabajador</th>
                <th className="px-4 py-3">Check-In</th>
                <th className="px-4 py-3">Estado (Editable)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-400">Cargando asistencia...</td></tr>}
              {!loading && filteredList.length === 0 && (
                <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-400">No hay registros recientes.</td></tr>
              )}

              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{new Date(item.servicio?.fecha).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{item.servicio?.turno}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.trabajador?.nombre}</div>
                    <div className="text-xs text-gray-500">{item.trabajador?.rut}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600">
                    {item.checkIn ? new Date(item.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "---"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`rounded-lg border px-2 py-1 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none
                        ${item.status === 'Presente' ? 'bg-green-50 text-green-700 border-green-200' : 
                          item.status === 'Ausente' ? 'bg-red-50 text-red-700 border-red-200' : 
                          'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                    >
                      {ATTENDANCE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}