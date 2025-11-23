// src/app/(protected)/admin/fleet/FleetClient.jsx
"use client";
import { useMemo, useState, useEffect } from "react";

/* ======== Validaciones ======== */
function validateBus({ patente, capacidad, proveedor }) {
  const e = {};
  if (!patente?.trim()) e.patente = "La patente es obligatoria.";
  if (!capacidad && capacidad !== 0) e.capacidad = "La capacidad es obligatoria.";
  else if (Number.isNaN(Number(capacidad)) || Number(capacidad) <= 0) e.capacidad = "Capacidad inválida.";
  if (!proveedor?.trim()) e.proveedor = "El proveedor es obligatorio.";
  return e;
}

/* ======== Formulario ======== */
function FleetForm({ initial, onCancel, onSubmit }) {
  const [patente, setPatente] = useState(initial?.patente ?? "");
  const [capacidad, setCapacidad] = useState(String(initial?.capacidad ?? ""));
  const [proveedor, setProveedor] = useState(initial?.proveedor ?? "");
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      patente: patente.trim().toUpperCase(),
      capacidad: Number(capacidad),
      proveedor: proveedor.trim(),
    };
    const err = validateBus(payload);
    setErrors(err);
    if (Object.keys(err).length) return;
    onSubmit(payload);
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900">
          {initial ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}
        </h2>
        <p className="text-sm text-slate-500">Ingresa los datos técnicos del bus.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Patente (PPU)</label>
            <input
              value={patente}
              onChange={(e) => setPatente(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono font-bold text-slate-900 uppercase placeholder:normal-case focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="XX-AB-11"
            />
            {errors.patente && <p className="mt-1 text-xs text-red-500 font-medium">{errors.patente}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Capacidad</label>
            <div className="relative">
              <input
                inputMode="numeric"
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all pl-10"
                placeholder="45"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">👤</span>
            </div>
            {errors.capacidad && <p className="mt-1 text-xs text-red-500 font-medium">{errors.capacidad}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Proveedor / Operador</label>
            <input
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Ej: Buses del Sur SpA"
            />
            {errors.proveedor && <p className="mt-1 text-xs text-red-500 font-medium">{errors.proveedor}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
          >
            {initial ? "Guardar Cambios" : "Registrar Vehículo"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ======== Tabla ======== */
function FleetTable({ fleet, onEdit, onDelete, onSearch, isLoading, error }) {
  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <div className="relative w-full md:w-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar patente o proveedor..."
            className="w-full md:w-80 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Total: <span className="text-slate-900 font-bold">{fleet.length}</span> vehículos
        </div>
      </div>

      {/* Vista Móvil (Tarjetas) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {isLoading && <div className="p-8 text-center text-slate-400">Cargando flota...</div>}
        {!isLoading && !error && fleet.map((b) => (
          <div key={b.id} className="relative rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
            <div className="absolute top-5 right-5 flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-green-600">Activo</span>
            </div>

            <div className="mb-4">
              <span className="inline-block rounded bg-slate-100 border border-slate-200 px-3 py-1 font-mono text-lg font-bold text-slate-800 tracking-wider">
                {b.patente}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase">Capacidad</span>
                <span className="font-medium text-slate-700">👤 {b.capacidad} pax</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase">Proveedor</span>
                <span className="font-medium text-slate-700 truncate">{b.proveedor}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-50 pt-3">
              <button onClick={() => onEdit(b)} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100">Editar</button>
              <button onClick={() => onDelete(b.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Vista Desktop (Tabla) */}
      <div className="hidden md:block rounded-2xl border border-slate-100 bg-white shadow-xl overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Patente</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Capacidad</th>
              <th className="px-6 py-4">Proveedor</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Cargando flota...</td></tr>
            )}
            {error && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-red-500 font-medium">{error}</td></tr>
            )}
            {!isLoading && !error && fleet.map((b) => (
              <tr key={b.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="inline-block rounded bg-slate-100 border border-slate-200 px-2.5 py-1 font-mono text-sm font-bold text-slate-800 tracking-wide">
                    {b.patente}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-bold text-green-600">Activo</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <span className="text-slate-400">👤</span> {b.capacidad}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                  {b.proveedor}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(b)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Editar"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00 2 2h11a2 2 0 00 2-2v-5m-1.414-9.414a2 2 0 11 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                      onClick={() => onDelete(b.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && !error && fleet.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <span className="text-4xl mb-3">🚌</span>
                    <p className="text-base font-medium text-slate-600">No hay buses registrados</p>
                    <p className="text-sm mt-1">Comienza agregando un nuevo vehículo a la flota.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======== Página cliente ======== */
export default function FleetClient() {
  const [fleet, setFleet] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/buses");
      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setFleet(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const list = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return fleet;
    return fleet.filter(b =>
      b.patente.toLowerCase().includes(f) ||
      b.proveedor.toLowerCase().includes(f)
    );
  }, [fleet, filter]);

  function handleNew() {
    setEditing(null);
    setShowForm(true);
  }
  function handleCancel() {
    setEditing(null);
    setShowForm(false);
  }
  function handleEdit(b) {
    setEditing(b);
    setShowForm(true);
  }

  async function handleSubmit(payload) {
    setError(null);
    const url = editing ? `/api/buses/${editing.id}` : '/api/buses';
    const method = editing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar el bus");
      }

      setShowForm(false);
      setEditing(null);
      await loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Estás seguro de que quieres eliminar este bus?")) return;
    setError(null);

    try {
      const res = await fetch(`/api/buses/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar el bus");
      }

      await loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-6xl pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Flota</h1>
          <p className="text-slate-500 mt-2 text-lg">Control y administración de vehículos.</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 transition-all"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Agregar Bus
        </button>
      </div>

      {showForm && (
        <div className="mb-8 animate-in slide-in-from-top-4 duration-300">
          <FleetForm initial={editing} onCancel={handleCancel} onSubmit={handleSubmit} />
        </div>
      )}

      <FleetTable
        fleet={list}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSearch={setFilter}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}