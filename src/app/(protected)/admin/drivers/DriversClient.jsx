// src/app/(protected)/admin/drivers/DriversClient.jsx
"use client";
import { useMemo, useState, useEffect } from "react";

/* ======== Validaciones (con RUT) ======== */
function validateDriver({ rut, nombre, licencia, contacto, email }, isEditing) {
  const e = {};
  if (!rut?.trim()) e.rut = "El RUT es obligatorio.";
  if (!nombre?.trim()) e.nombre = "El nombre es obligatorio.";
  if (!licencia?.trim()) e.licencia = "La licencia es obligatoria.";
  if (!contacto?.trim()) e.contacto = "El contacto es obligatorio.";

  // Validación extra solo si estamos creando (requiere email)
  if (!isEditing) {
    if (!email?.trim()) {
      e.email = "El correo es obligatorio para crear la cuenta.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Formato de correo inválido.";
    }
  }
  return e;
}

/* ======== Formulario Moderno ======== */
function DriverForm({ initial, onCancel, onSubmit }) {
  const [rut, setRut] = useState(initial?.rut ?? "");
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [licencia, setLicencia] = useState(initial?.licencia ?? "");
  const [contacto, setContacto] = useState(initial?.contacto ?? "");

  // Nuevo campo para Login (solo al crear)
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState({});
  const isEditing = !!initial;

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      rut: rut.trim(),
      nombre: nombre.trim(),
      licencia: licencia.trim().toUpperCase(),
      contacto: contacto.trim(),
      email: !isEditing ? email.trim() : undefined
    };

    const err = validateDriver(payload, isEditing);
    setErrors(err);
    if (Object.keys(err).length) return;

    onSubmit(payload);
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">{isEditing ? "Editar Chofer" : "Nuevo Chofer"}</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Campo RUT */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">RUT</label>
            <input
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="12.345.678-9"
            />
            {errors.rut && <p className="mt-1 text-xs text-red-500 font-medium">{errors.rut}</p>}
          </div>

          {/* Campo Nombre */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Nombre y Apellido"
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-500 font-medium">{errors.nombre}</p>}
          </div>

          {/* Campo Licencia */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Licencia</label>
            <input
              value={licencia}
              onChange={(e) => setLicencia(e.target.value)}
              className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="A-1 / A-2 / A-3…"
            />
            {errors.licencia && <p className="mt-1 text-xs text-red-500 font-medium">{errors.licencia}</p>}
          </div>

          {/* Campo Contacto */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contacto</label>
            <input
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="+56 9 5555 5555"
            />
            {errors.contacto && <p className="mt-1 text-xs text-red-500 font-medium">{errors.contacto}</p>}
          </div>

          {/* SECCIÓN LOGIN AUTOMÁTICO (Solo al crear) */}
          {!isEditing && (
            <div className="md:col-span-3 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                Cuenta de Acceso (Login)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-blue-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="chofer@empresa.cl"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
                </div>
                <div className="flex items-center">
                  <p className="text-xs text-blue-600 bg-blue-100/50 p-3 rounded-lg border border-blue-200/50">
                    ℹ️ Se creará un usuario automáticamente con la contraseña: <strong>1234</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
          <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all">
            {initial ? "Guardar Cambios" : "Crear Chofer y Usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ======== Tabla Modernizada ======== */
function DriversTable({ drivers, onEdit, onDelete, onSearch, isLoading, error }) {
  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <input
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar por nombre, RUT o licencia..."
          className="w-full md:w-96 rounded-xl border-0 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all"
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Licencia</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Cargando choferes...</td></tr>
              )}
              {error && (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-red-500">{error}</td></tr>
              )}
              {!isLoading && !error && drivers.map((d) => (
                <tr key={d.id} className="group hover:bg-slate-50/50 transition-colors">

                  <td className="px-6 py-4 font-mono text-slate-600">{d.rut}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{d.nombre}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-600/10">
                      {d.licencia}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{d.contacto}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(d)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Editar">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => onDelete(d.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Eliminar">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !error && drivers.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No hay choferes registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards Mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {isLoading ? (
          <p className="text-center text-slate-400 py-8">Cargando...</p>
        ) : !error && drivers.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Sin resultados.</p>
        ) : (
          drivers.map(d => (
            <div key={d.id} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900">{d.nombre}</h3>
                  <p className="text-sm font-mono text-slate-500 mt-1">{d.rut}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-600/10">
                  {d.licencia}
                </span>
              </div>
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {d.contacto}
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-50 mt-1">
                <button onClick={() => onEdit(d)} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Editar
                </button>
                <button onClick={() => onDelete(d.id)} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700">
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

/* ======== Página cliente (Lógica API) ======== */
export default function DriversClient() {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

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

  useEffect(() => { loadData(); }, []);

  const list = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return drivers;
    return drivers.filter(d =>
      d.nombre.toLowerCase().includes(f) ||
      d.rut.toLowerCase().includes(f) ||
      d.licencia.toLowerCase().includes(f)
    );
  }, [drivers, filter]);

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
      await loadData();

      if (!editing) {
        alert("¡Chofer y Usuario creados exitosamente!\n\nClave temporal: 1234");
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Estás seguro? Esto eliminará al chofer.\n(El usuario de acceso NO se borrará automáticamente por seguridad).")) return;
    setError(null);

    try {
      const res = await fetch(`/api/drivers/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }

      await loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Choferes</h1>
          <p className="text-slate-500 mt-1">Administre la flota de conductores y sus credenciales.</p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-[1.02] transition-all"
        >
          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Chofer
        </button>
      </div>

      {showForm && (
        <DriverForm initial={editing} onCancel={handleCancel} onSubmit={handleSubmit} />
      )}

      <DriversTable
        drivers={list}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSearch={setFilter}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}