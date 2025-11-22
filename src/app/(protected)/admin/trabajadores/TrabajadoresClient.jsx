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
      encoding: "UTF-8", // Ajustar según origen (Excel suele usar esto)
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

        // Enviar a la API (Bulk Insert)
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
          event.target.value = null; // Reset input
        }
      },
      error: (err) => {
        setUploadFeedback({ type: 'error', msg: `Error lectura: ${err.message}` });
        setIsUploading(false);
      }
    });
  };

  // 3. Manejo de Formulario Manual
  // ...
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

      const data = await res.json(); // 👈 Leemos la respuesta SIEMPRE

      if (res.ok) {
        loadWorkers();
        setIsFormOpen(false);
        setFormData({ rut: "", nombre: "", area: "" });
        setEditingId(null);
      } else {
        // 👈 Mostramos el error específico que viene del backend
        alert(`Error: ${data.error || "No se pudo guardar el trabajador"}`);
      }
    } catch (err) {
      alert("Error de conexión con el servidor.");
    }
  };
  // ...

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
    <div className="mx-auto grid max-w-6xl gap-6 text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Gestión de Trabajadores</h1>
        <button 
          onClick={() => { setIsFormOpen(true); setEditingId(null); setFormData({ rut: "", nombre: "", area: "" }); }}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          + Nuevo
        </button>
      </div>

      {/* Formulario Manual */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="rounded-2xl border bg-slate-50 p-4 space-y-3 shadow-inner">
          <h3 className="font-semibold text-sm">{editingId ? "Editar Trabajador" : "Nuevo Trabajador"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="RUT (ej. 12.345.678-9)" className="rounded border p-2" required 
              value={formData.rut} onChange={e => setFormData({...formData, rut: e.target.value})} />
            <input placeholder="Nombre Completo" className="rounded border p-2" required 
              value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            <input placeholder="Área (ej. Planta)" className="rounded border p-2" 
              value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-3 py-1 text-sm border rounded bg-white">Cancelar</button>
            <button type="submit" className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">Guardar</button>
          </div>
        </form>
      )}

      {/* Importador CSV */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-medium mb-2">Carga Masiva (CSV)</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading}
          className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {uploadFeedback.msg && (
          <p className={`mt-2 text-sm ${uploadFeedback.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {uploadFeedback.msg}
          </p>
        )}
      </section>

      {/* Tabla */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <input 
            placeholder="Buscar..." 
            className="w-full md:w-1/3 rounded border p-2 text-sm"
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-50 text-gray-500">
              <tr>
                <th className="px-4 py-3">RUT</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center">Cargando...</td></tr>
              ) : filteredList.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Sin datos.</td></tr>
              ) : (
                filteredList.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono">{t.rut}</td>
                    <td className="px-4 py-3">{t.nombre}</td>
                    <td className="px-4 py-3">{t.area}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openEdit(t)} className="text-blue-600 hover:underline">Editar</button>
                      <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:underline">Borrar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}