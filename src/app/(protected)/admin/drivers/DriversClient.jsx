// src/app/(protected)/admin/drivers/DriversClient.jsx
"use client";
import { useMemo, useState, useEffect } from "react"; // 👈 1. Importar useEffect

/* ======== Validaciones (con RUT) ======== */
function validateDriver({ rut, nombre, licencia, contacto }) {
  const e = {};
  if (!rut?.trim())      e.rut      = "El RUT es obligatorio.";
  if (!nombre?.trim())   e.nombre   = "El nombre es obligatorio.";
  if (!licencia?.trim()) e.licencia = "La licencia es obligatoria.";
  if (!contacto?.trim()) e.contacto = "El contacto es obligatorio.";
  return e;
}

/* ======== Formulario (con RUT) ======== */
function DriverForm({ initial, onCancel, onSubmit }) {
  const [rut, setRut]           = useState(initial?.rut ?? "");
  const [nombre, setNombre]     = useState(initial?.nombre ?? "");
  const [licencia, setLicencia] = useState(initial?.licencia ?? "");
  const [contacto, setContacto] = useState(initial?.contacto ?? "");
  const [errors, setErrors]     = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      rut: rut.trim(),
      nombre: nombre.trim(),
      licencia: licencia.trim().toUpperCase(),
      contacto: contacto.trim(),
    };
    const err = validateDriver(payload);
    setErrors(err);
    if (Object.keys(err).length) return;
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Campo RUT */}
        <div>
          <label className="block text-sm font-medium text-black">RUT</label>
          <input
            value={rut}
            onChange={(e)=>setRut(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="12.345.678-9"
          />
          {errors.rut && <p className="mt-1 text-xs text-red-600">{errors.rut}</p>}
        </div>
        {/* Campo Nombre */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-black">Nombre</label>
          <input
            value={nombre}
            onChange={(e)=>setNombre(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Nombre y Apellido"
          />
          {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
        </div>
        {/* Campo Licencia */}
        <div>
          <label className="block text-sm font-medium text-black">Licencia</label>
          <input
            value={licencia}
            onChange={(e)=>setLicencia(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="A-1 / A-2 / A-3…"
          />
          {errors.licencia && <p className="mt-1 text-xs text-red-600">{errors.licencia}</p>}
        </div>
        {/* Campo Contacto */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-black">Contacto</label>
          <input
            value={contacto}
            onChange={(e)=>setContacto(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="+56 9 5555 5555"
          />
          {errors.contacto && <p className="mt-1 text-xs text-red-600">{errors.contacto}</p>}
        </div>
      </div>
      {/* Botones */}
      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm text-black hover:bg-black/5">Cancelar</button>
        <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          {initial ? "Guardar cambios" : "Crear chofer"}
        </button>
      </div>
    </form>
  );
}

/* ======== Tabla (Se añade isLoading y error) ======== */
function DriversTable({ drivers, onEdit, onDelete, onSearch, isLoading, error }) {
  return (
    <div className="rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <input
          onChange={(e)=>onSearch(e.target.value)}
          placeholder="Buscar por nombre/rut/licencia…"
          className="w-72 max-w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-black/70">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">RUT</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Licencia</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {/* 👈 2. Lógica de carga y error */}
            {isLoading && (
              <tr><td colSpan="6" className="px-4 py-6 text-center text-black/60">Cargando choferes...</td></tr>
            )}
            {error && (
              <tr><td colSpan="6" className="px-4 py-6 text-center text-red-600">{error}</td></tr>
            )}
            {!isLoading && !error && drivers.map((d) => (
              <tr key={d.id} className="odd:bg-white even:bg-slate-50/30">
                <td className="px-4 py-3">{d.id}</td>
                <td className="px-4 py-3">{d.rut}</td>
                <td className="px-4 py-3">{d.nombre}</td>
                <td className="px-4 py-3">{d.licencia}</td>
                <td className="px-4 py-3">{d.contacto}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=>onEdit(d)} className="mr-2 rounded-lg border px-3 py-1 hover:bg-black/5">Editar</button>
                  <button onClick={()=>onDelete(d.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-red-700 hover:bg-red-100">Borrar</button>
                </td>
              </tr>
            ))}
            {!isLoading && !error && drivers.length === 0 && (
              <tr><td colSpan="6" className="px-4 py-6 text-center text-black/60">No hay choferes registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======== Página cliente (LÓGICA DE API) ======== */
export default function DriversClient() {
  // 👈 3. Estados para datos, carga y filtro
  const [drivers, setDrivers]   = useState([]); // Inicia vacío
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const [filter, setFilter]     = useState("");
  const [editing, setEditing]   = useState(null);
  const [showForm, setShowForm] = useState(false);

  // 👈 4. Función para cargar datos desde la API
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/drivers");
      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setDrivers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 👈 5. Cargar datos cuando el componente se monta
  useEffect(() => {
    loadData();
  }, []);
  
  // 👈 6. Lógica de filtro
  const list = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return drivers;
    return drivers.filter(d =>
      d.nombre.toLowerCase().includes(f) ||
      d.rut.toLowerCase().includes(f) ||
      d.licencia.toLowerCase().includes(f)
    );
  }, [drivers, filter]);

  // --- (Funciones de formulario sin cambios) ---
  function handleNew() {
    setEditing(null);
    setShowForm(true);
  }
  function handleCancel() {
    setEditing(null);
    setShowForm(false);
  }
  function handleEdit(d) {
    setEditing(d);
    setShowForm(true);
  }

  // 👈 7. handleSubmit (POST / PUT)
  async function handleSubmit(payload) {
    setError(null);
    const url = editing ? `/api/drivers/${editing.id}` : '/api/drivers';
    const method = editing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar el chofer");
      }
      
      setShowForm(false);
      setEditing(null);
      await loadData(); // Recargar la tabla
    } catch (err) {
      alert(`Error: ${err.message}`);
      setError(err.message);
    }
  }
  
  // 👈 8. handleDelete (DELETE)
  async function handleDelete(id) {
    if (!confirm("¿Estás seguro de que quieres eliminar este chofer?")) return;
    setError(null);

    try {
      const res = await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar el chofer");
      }

      await loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto grid text-black max-w-6xl gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">Administración — Choferes</h1>
        <button
          onClick={handleNew}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Agregar chofer
        </button>
      </div>

      {showForm && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-black">{editing ? "Editar chofer" : "Nuevo chofer"}</h2>
          <DriverForm initial={editing} onCancel={handleCancel} onSubmit={handleSubmit} />
        </div>
      )}

      <DriversTable 
        drivers={list} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        onSearch={setFilter}
        isLoading={isLoading} // 👈 9. Pasar estado de carga
        error={error}       // 👈 9. Pasar estado de error
      />
    </div>
  );
}