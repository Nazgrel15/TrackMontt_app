"use client";
import { useMemo, useState } from "react";

/* ======== Datos mock estables ======== */
const INITIAL_DRIVERS = Object.freeze([
  { id: "C-001", nombre: "Pedro Muñoz",  licencia: "A-3",  contacto: "+56 9 7777 1111" },
  { id: "C-002", nombre: "Laura Soto",   licencia: "A-2",  contacto: "+56 9 8888 2222" },
  { id: "C-003", nombre: "Héctor Pérez", licencia: "A-1",  contacto: "+56 9 9999 3333" },
]);

/* ======== Validaciones ======== */
function validateDriver({ nombre, licencia, contacto }) {
  const e = {};
  if (!nombre?.trim())   e.nombre   = "El nombre es obligatorio.";
  if (!licencia?.trim()) e.licencia = "La licencia es obligatoria.";
  if (!contacto?.trim()) e.contacto = "El contacto es obligatorio.";
  // opcional: validar formato simple para teléfono chileno
  if (contacto && !/^\+?\d[\d\s-]{7,}$/.test(contacto)) {
    e.contacto = "Formato de contacto inválido.";
  }
  return e;
}

/* ======== Helpers para IDs ======== */
function seqFromSeed(seed) {
  const nums = seed
    .map(d => Number(String(d.id || "").split("-")[1]))
    .filter(n => !Number.isNaN(n));
  return nums.length ? Math.max(...nums) + 1 : 1; // si tienes C-001..C-003 => 4
}
function makeId(n) {
  return `C-${String(n).padStart(3, "0")}`;
}

/* ======== Formulario ======== */
function DriverForm({ initial, onCancel, onSubmit }) {
  const [nombre, setNombre]     = useState(initial?.nombre ?? "");
  const [licencia, setLicencia] = useState(initial?.licencia ?? "");
  const [contacto, setContacto] = useState(initial?.contacto ?? "");
  const [errors, setErrors]     = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-black">Nombre</label>
          <input
            value={nombre}
            onChange={(e)=>setNombre(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Nombre y Apellido"
          />
          {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
        </div>

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

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm text-black hover:bg-black/5">Cancelar</button>
        <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          {initial ? "Guardar cambios" : "Crear chofer"}
        </button>
      </div>
    </form>
  );
}

/* ======== Tabla ======== */
function DriversTable({ drivers, onEdit, onDelete, onSearch }) {
  return (
    <div className="rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <input
          onChange={(e)=>onSearch(e.target.value)}
          placeholder="Buscar por nombre/licencia/contacto…"
          className="w-72 max-w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-black/70">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Licencia</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {drivers.map((d) => (
              <tr key={d.id} className="odd:bg-white even:bg-slate-50/30">
                <td className="px-4 py-3">{d.id}</td>
                <td className="px-4 py-3">{d.nombre}</td>
                <td className="px-4 py-3">{d.licencia}</td>
                <td className="px-4 py-3">{d.contacto}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=>onEdit(d)} className="mr-2 rounded-lg border px-3 py-1 hover:bg-black/5">Editar</button>
                  <button onClick={()=>onDelete(d.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-red-700 hover:bg-red-100">Borrar</button>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-black/60">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======== Página cliente ======== */
export default function DriversClient() {
  const [drivers, setDrivers]   = useState(() => [...INITIAL_DRIVERS]);
  const [seq, setSeq]           = useState(() => seqFromSeed(INITIAL_DRIVERS)); // p.ej. 4
  const [filter, setFilter]     = useState("");
  const [editing, setEditing]   = useState(null);
  const [showForm, setShowForm] = useState(false);

  const list = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return drivers;
    return drivers.filter(d =>
      d.nombre.toLowerCase().includes(f) ||
      d.licencia.toLowerCase().includes(f) ||
      d.contacto.toLowerCase().includes(f)
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
  function handleSubmit(payload) {
    if (editing) {
      setDrivers(prev => prev.map(d => (d.id === editing.id ? { ...editing, ...payload } : d)));
    } else {
      // Evitar duplicado muy básico por nombre + contacto
      const exists = drivers.some(x =>
        x.nombre.toLowerCase() === payload.nombre.toLowerCase() &&
        x.contacto.toLowerCase() === payload.contacto.toLowerCase()
      );
      if (exists) {
        alert("Ya existe un chofer con ese nombre y contacto.");
        return;
      }
      const id = makeId(seq);
      setSeq(n => n + 1);
      setDrivers(prev => [...prev, { id, ...payload }]);
    }
    setShowForm(false);
    setEditing(null);
  }
  function handleEdit(d) {
    setEditing(d);
    setShowForm(true);
  }
  function handleDelete(id) {
    setDrivers(prev => prev.filter(d => d.id !== id));
  }

  return (
    <div className="mx-auto grid text-black max-w-6xl gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">Administración — Choferes</h1>
        <button
          onClick={handleNew}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          title="Mock: sin backend aún"
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

      <DriversTable drivers={list} onEdit={handleEdit} onDelete={handleDelete} onSearch={setFilter} />
    </div>
  );
}
