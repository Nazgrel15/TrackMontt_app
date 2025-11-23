// src/app/(protected)/admin/trabajadores/TrabajadoresClient.jsx
"use client";
import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";

// Helper simple de validación
function validateRow(row, index) {
  const errors = [];
  if (!row.rut?.trim()) errors.push(`Fila ${index + 2}: Falta RUT.`);
  if (!row.nombre?.trim()) errors.push(`Fila ${index + 2}: Falta nombre.`);
  return errors;
}

export default function TrabajadoresClient() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  // Estados para carga CSV
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState({ type: '', msg: '' });

  // Estados para formulario manual (Crear/Editar)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ rut: "", nombre: "", area: "" });

  // 1. Cargar datos iniciales
  const loadWorkers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workers");
      if (res.ok) setTrabajadores(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWorkers(); }, []);

  // 2. Manejo de CSV (Carga Masiva)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadFeedback({ type: 'info', msg: 'Procesando archivo...' });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: async (results) => {
        const data = results.data;
        const errors = [];
        const validRows = [];

        data.forEach((row, index) => {
          const rowErrors = validateRow(row, index);
          if (rowErrors.length > 0) errors.push(...rowErrors);
          else validRows.push({
            rut: row.rut.trim(),
            nombre: row.nombre.trim(),
            area: row.area?.trim() || "General"
          });
        });

        if (errors.length > 0) {
          setUploadFeedback({ type: 'error', msg: `Errores en CSV: ${errors.slice(0, 3).join(", ")}...` });
          setIsUploading(false);
          return;
        }

        try {
          const res = await fetch("/api/workers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validRows)
          });

          const responseData = await res.json();

          if (res.ok) {
            setUploadFeedback({ type: 'success', msg: responseData.message || "Importación exitosa." });
            loadWorkers();
          } else {
            setUploadFeedback({ type: 'error', msg: responseData.error || "Error en el servidor." });
          }
        } catch (e) {
          setUploadFeedback({ type: 'error', msg: "Error de conexión." });
        } finally {
          setIsUploading(false);
          event.target.value = null;
        }
      },
      error: (err) => {
        setUploadFeedback({ type: 'error', msg: `Error lectura: ${err.message}` });
        setIsUploading(false);
      }
    });
  };

  // 3. Manejo de Formulario Manual
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/workers/${editingId}` : "/api/workers";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        loadWorkers();
        setIsFormOpen(false);
        setFormData({ rut: "", nombre: "", area: "" });
        setEditingId(null);
      } else {
        alert(`Error: ${data.error || "No se pudo guardar el trabajador"}`);
      }
    } catch (err) {
      alert("Error de conexión con el servidor.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar trabajador? Se borrará su historial de asistencia.")) return;
    try {
      const res = await fetch(`/api/workers/${id}`, { method: "DELETE" });
      if (res.ok) loadWorkers();
      else alert("Error al eliminar");
    } catch (e) { alert("Error de conexión"); }
  };

  const openEdit = (worker) => {
    setFormData({ rut: worker.rut, nombre: worker.nombre, area: worker.area });
    setEditingId(worker.id);
    setIsFormOpen(true);
  };

  const filteredList = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return trabajadores;
    return trabajadores.filter(t =>
      t.nombre.toLowerCase().includes(f) || t.rut.toLowerCase().includes(f)
    );
  }, [trabajadores, filter]);

  return (
    <div className="mx-auto max-w-[1600px] p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Trabajadores</h1>
          <p className="text-slate-500 mt-1">Administre el personal y sus asignaciones.</p>
        </div>
        <button
          onClick={() => { setIsFormOpen(true); setEditingId(null); setFormData({ rut: "", nombre: "", area: "" }); }}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-[1.02] transition-all"
        >
          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Trabajador
        </button>
      </div>

      {/* Formulario Manual */}
      {isFormOpen && (
        <div className="rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">{editingId ? "Editar Trabajador" : "Nuevo Trabajador"}</h3>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">RUT</label>
                <input
                  placeholder="12.345.678-9"
                  className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                  value={formData.rut}
                  onChange={e => setFormData({ ...formData, rut: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Completo</label>
                <input
                  placeholder="Juan Pérez"
                  className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Área</label>
                <input
                  placeholder="Planta / Administración"
                  className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                  value={formData.area}
                  onChange={e => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
              <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all">Guardar Cambios</button>
            </div>
          </form>
        </div>
      )}

      {/* Importador CSV */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Carga Masiva</h2>
            <p className="text-sm text-slate-500">Importe trabajadores desde un archivo CSV.</p>
          </div>
          <div className="flex items-center gap-4">
            <label className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all
              ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              {isUploading ? "Subiendo..." : "Seleccionar Archivo"}
              <input type="file" accept=".csv" onChange={handleFileChange} disabled={isUploading} className="hidden" />
            </label>
          </div>
        </div>
        {uploadFeedback.msg && (
          <div className={`mt-4 rounded-xl p-3 text-sm font-medium flex items-center gap-2
            ${uploadFeedback.type === 'error' ? 'bg-red-50 text-red-700' :
              uploadFeedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
            <span>{uploadFeedback.type === 'error' ? '⚠️' : uploadFeedback.type === 'success' ? '✅' : 'ℹ️'}</span>
            {uploadFeedback.msg}
          </div>
        )}
      </section>

      {/* Buscador */}
      <div className="relative">
        <input
          placeholder="Buscar por nombre o RUT..."
          className="w-full md:w-96 rounded-xl border-0 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all"
          onChange={e => setFilter(e.target.value)}
        />
        <svg className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      {/* Tabla Desktop */}
      <div className="hidden md:block rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">RUT</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Área</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Cargando trabajadores...</td></tr>
              ) : filteredList.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No se encontraron trabajadores.</td></tr>
              ) : (
                filteredList.map(t => (
                  <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-600">{t.rut}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{t.nombre}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-600/10">
                        {t.area}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(t)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Editar">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Eliminar">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards Mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading ? (
          <p className="text-center text-slate-400 py-8">Cargando...</p>
        ) : filteredList.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Sin resultados.</p>
        ) : (
          filteredList.map(t => (
            <div key={t.id} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900">{t.nombre}</h3>
                  <p className="text-sm font-mono text-slate-500 mt-1">{t.rut}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-600/10">
                  {t.area}
                </span>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-50 mt-1">
                <button onClick={() => openEdit(t)} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Editar
                </button>
                <button onClick={() => handleDelete(t.id)} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}