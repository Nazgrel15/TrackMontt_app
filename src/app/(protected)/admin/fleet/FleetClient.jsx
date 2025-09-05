"use client";
import { useMemo, useState } from "react";

/* ======== Datos mock estables ======== */
const INITIAL_FLEET = Object.freeze([
  { id: "B-001", patente: "XX-AB-11", capacidad: 45, proveedor: "Buses Sur" },
  { id: "B-002", patente: "YY-CD-22", capacidad: 40, proveedor: "TransPorto" },
  { id: "B-003", patente: "ZZ-EF-33", capacidad: 30, proveedor: "LogiBus"   },
]);

/* ======== Validaciones ======== */
function validateBus({ patente, capacidad, proveedor }) {
  const e = {};
  if (!patente?.trim()) e.patente = "La patente es obligatoria.";
  if (!capacidad && capacidad !== 0) e.capacidad = "La capacidad es obligatoria.";
  else if (Number.isNaN(Number(capacidad)) || Number(capacidad) <= 0) e.capacidad = "Capacidad inválida.";
  if (!proveedor?.trim()) e.proveedor = "El proveedor es obligatorio.";
  return e;
}

/* ======== Helpers para IDs ======== */
function initialSeqFrom(seed) {
  const nums = seed
    .map((b) => Number(String(b.id || "").split("-")[1]))
    .filter((n) => !Number.isNaN(n));
  return nums.length ? Math.max(...nums) + 1 : 1; // si tienes B-001..B-003 => 4
}
function makeId(n) {
  return `B-${String(n).padStart(3, "0")}`;
}

/* ======== Formulario ======== */
function FleetForm({ initial, onCancel, onSubmit }) {
  const [patente, setPatente]     = useState(initial?.patente ?? "");
  const [capacidad, setCapacidad] = useState(String(initial?.capacidad ?? ""));
  const [proveedor, setProveedor] = useState(initial?.proveedor ?? "");
  const [errors, setErrors]       = useState({});

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
    onSubmit(payload); // ← el ID/edición se maneja en el componente padre
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-black">Patente</label>
          <input
            value={patente}
            onChange={(e)=>setPatente(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="XX-AB-11"
          />
          {errors.patente && <p className="mt-1 text-xs text-red-600">{errors.patente}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Capacidad</label>
          <input
            inputMode="numeric"
            value={capacidad}
            onChange={(e)=>setCapacidad(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="45"
          />
          {errors.capacidad && <p className="mt-1 text-xs text-red-600">{errors.capacidad}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-black">Proveedor</label>
          <input
            value={proveedor}
            onChange={(e)=>setProveedor(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Buses Sur"
          />
          {errors.proveedor && <p className="mt-1 text-xs text-red-600">{errors.proveedor}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm text-black hover:bg-black/5">Cancelar</button>
        <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          {initial ? "Guardar cambios" : "Crear bus"}
        </button>
      </div>
    </form>
  );
}

/* ======== Tabla ======== */
function FleetTable({ fleet, onEdit, onDelete, onSearch }) {
  return (
    <div className="rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <input
          onChange={(e)=>onSearch(e.target.value)}
          placeholder="Buscar por patente/proveedor…"
          className="w-72 max-w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-black/70">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Patente</th>
              <th className="px-4 py-3">Capacidad</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {fleet.map((b) => (
              <tr key={b.id} className="odd:bg-white even:bg-slate-50/30">
                <td className="px-4 py-3">{b.id}</td>
                <td className="px-4 py-3">{b.patente}</td>
                <td className="px-4 py-3">{b.capacidad}</td>
                <td className="px-4 py-3">{b.proveedor}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=>onEdit(b)} className="mr-2 rounded-lg border px-3 py-1 hover:bg-black/5">Editar</button>
                  <button onClick={()=>onDelete(b.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-red-700 hover:bg-red-100">Borrar</button>
                </td>
              </tr>
            ))}
            {fleet.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-black/60">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======== Página cliente ======== */
export default function FleetClient() {
  const [fleet, setFleet]   = useState(() => [...INITIAL_FLEET]);
  const [seq, setSeq]       = useState(() => initialSeqFrom(INITIAL_FLEET)); // p.ej. 4
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

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
  function handleSubmit(payload) {
    // (opcional) evita duplicados por patente al crear
    if (!editing) {
      const exists = fleet.some(x => x.patente.toUpperCase() === payload.patente.toUpperCase());
      if (exists) {
        alert("Ya existe un bus con esa patente.");
        return;
      }
    }

    if (editing) {
      setFleet(prev => prev.map(b => (b.id === editing.id ? { ...editing, ...payload } : b)));
    } else {
      const id = makeId(seq);
      setSeq(n => n + 1);
      setFleet(prev => [...prev, { id, ...payload }]);
    }
    setShowForm(false);
    setEditing(null);
  }
  function handleEdit(b) {
    setEditing(b);
    setShowForm(true);
  }
  function handleDelete(id) {
    setFleet(prev => prev.filter(b => b.id !== id));
  }

  return (
    <div className="mx-auto grid text-black max-w-6xl gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">Administración — Flota</h1>
        <button
          onClick={handleNew}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          title="Mock: sin backend aún"
        >
          Agregar bus
        </button>
      </div>

      {showForm && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-black">{editing ? "Editar bus" : "Nuevo bus"}</h2>
          <FleetForm initial={editing} onCancel={handleCancel} onSubmit={handleSubmit} />
        </div>
      )}

      <FleetTable fleet={list} onEdit={handleEdit} onDelete={handleDelete} onSearch={setFilter} />
    </div>
  );
}
