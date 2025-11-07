"use client";
import { useMemo, useState } from "react";

/** ---------- Mocks estables (no usar Date.now en SSR) ---------- **/
const MOCK_BUSES = Object.freeze([
  { id: "B-01", placa: "XX-AB-11", capacidad: 45 },
  { id: "B-02", placa: "YY-CD-22", capacidad: 40 },
  { id: "B-03", placa: "ZZ-EF-33", capacidad: 30 },
]);
const MOCK_CHOFERES = Object.freeze([
  { id: "C-01", nombre: "Pedro Muñoz" },
  { id: "C-02", nombre: "Laura Soto" },
  { id: "C-03", nombre: "Héctor Pérez" },
]);
const SHIFTS = ["Mañana", "Tarde", "Noche"];

/** ---------- Utilidades ---------- **/
function parseParadas(text) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}
function prettyParadas(arr) {
  return arr.join(" → ");
}
// Conflicto simple: mismo bus + misma fecha + mismo turno
function hasBusConflict(services, { busId, fecha, turno }, excludeId) {
  return services.some(
    (s) =>
      s.id !== excludeId &&
      s.busId === busId &&
      s.fecha === fecha &&
      s.turno === turno
  );
}

/** ---------- Diálogo Clonar (mínimo) ---------- **/
function CloneDialog({ base, services, onCancel, onConfirm }) {
  const [fecha, setFecha] = useState(base.fecha || "");
  const [turno, setTurno] = useState(base.turno || SHIFTS[0]);
  const [error, setError] = useState("");

  function submit() {
    setError("");
    if (!fecha) return setError("Selecciona una fecha.");
    if (hasBusConflict(services, { busId: base.busId, fecha, turno }, base.id)) {
      return setError("Conflicto: ese bus ya tiene servicio en esa fecha y turno.");
    }
    onConfirm({ fecha, turno });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.12)]">
        <h3 className="mb-3 text-lg font-semibold text-neutral-900">Clonar servicio</h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-neutral-800">Fecha</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                         text-neutral-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-neutral-800">Turno</span>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                         text-neutral-900 focus:border-blue-500 focus:ring-blue-500"
            >
              {SHIFTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm text-neutral-800 hover:bg-black/5"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Crear borrador
          </button>
        </div>
      </div>
    </div>
  );
}

/** ---------- Formulario ---------- **/
function ServiceForm({ initial, onCancel, onSubmit }) {
  const [fecha, setFecha] = useState(initial?.fecha ?? "");
  const [turno, setTurno] = useState(initial?.turno ?? SHIFTS[0]);
  const [busId, setBusId] = useState(initial?.busId ?? MOCK_BUSES[0].id);
  const [choferId, setChoferId] = useState(initial?.choferId ?? MOCK_CHOFERES[0].id);
  const [paradasTxt, setParadasTxt] = useState(
    initial?.paradas ? initial.paradas.join("\n") : "Terminal\nPlanta Chincui"
  );
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!fecha) e.fecha = "La fecha es obligatoria.";
    const arr = parseParadas(paradasTxt);
    if (arr.length < 2) e.paradas = "Agrega al menos 2 paradas (una por línea).";
    if (!busId) e.busId = "Selecciona un bus.";
    if (!choferId) e.choferId = "Selecciona un chofer.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      id: initial?.id ?? null,
      fecha,
      turno,
      paradas: parseParadas(paradasTxt),
      busId,
      choferId,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)] text-neutral-900"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-800">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                       text-neutral-900 placeholder-neutral-500
                       focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.fecha && <p className="mt-1 text-xs text-red-600">{errors.fecha}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-800">Turno</label>
          <select
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                       text-neutral-900 placeholder-neutral-500
                       focus:border-blue-500 focus:ring-blue-500"
          >
            {SHIFTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-800">Bus</label>
          <select
            value={busId}
            onChange={(e) => setBusId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                       text-neutral-900 placeholder-neutral-500
                       focus:border-blue-500 focus:ring-blue-500"
          >
            {MOCK_BUSES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} — {b.placa} · {b.capacidad} pax
              </option>
            ))}
          </select>
          {errors.busId && <p className="mt-1 text-xs text-red-600">{errors.busId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-800">Chofer</label>
          <select
            value={choferId}
            onChange={(e) => setChoferId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                       text-neutral-900 placeholder-neutral-500
                       focus:border-blue-500 focus:ring-blue-500"
          >
            {MOCK_CHOFERES.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          {errors.choferId && <p className="mt-1 text-xs text-red-600">{errors.choferId}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-800">
            Paradas (una por línea)
          </label>
          <textarea
            rows={4}
            value={paradasTxt}
            onChange={(e) => setParadasTxt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                       text-neutral-900 placeholder-neutral-500
                       focus:border-blue-500 focus:ring-blue-500"
            placeholder={"Ej:\nTerminal\nPlanta Chincui"}
          />
          {errors.paradas && <p className="mt-1 text-xs text-red-600">{errors.paradas}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-4 py-2 text-sm text-neutral-800 hover:bg-black/5"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Guardar servicio
        </button>
      </div>
    </form>
  );
}

/** ---------- Tabla ---------- **/
function ServicesTable({ services, onEdit, onDelete, onClone }) {
  if (services.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center text-neutral-700 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        No hay servicios planificados aún.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <table className="min-w-full text-sm text-neutral-800">
        <thead className="bg-slate-50 text-left text-neutral-700">
          <tr>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Turno</th>
            <th className="px-4 py-3">Paradas</th>
            <th className="px-4 py-3">Bus</th>
            <th className="px-4 py-3">Chofer</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {services.map((s) => (
            <tr key={s.id} className="odd:bg-white even:bg-slate-50/40">
              <td className="px-4 py-3">{s.fecha}</td>
              <td className="px-4 py-3">{s.turno}</td>
              <td className="px-4 py-3">{prettyParadas(s.paradas)}</td>
              <td className="px-4 py-3">{s.busId}</td>
              <td className="px-4 py-3">{s.choferId}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(s)}
                  className="mr-2 rounded-lg border px-3 py-1 text-neutral-700 hover:bg-black/5"
                >
                  Editar
                </button>
                <button
                  onClick={() => onClone(s)}
                  className="mr-2 rounded-lg border px-3 py-1 text-neutral-700 hover:bg-black/5"
                >
                  Clonar
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-red-700 hover:bg-red-100"
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** ---------- Página ---------- **/
export default function PlaninngPage() {
  // contador simple para IDs predecibles en cliente
  const [seq, setSeq] = useState(1);
  const [editing, setEditing] = useState(null);
  const [services, setServices] = useState(() => [
    // ejemplo inicial
    {
      id: "S-000",
      fecha: "2025-09-05",
      turno: "Mañana",
      paradas: ["Terminal", "Planta Chincui"],
      busId: "B-01",
      choferId: "C-01",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  // estado para clonar
  const [cloneBase, setCloneBase] = useState(null);

  const titulo = useMemo(
    () => (editing ? "Editar servicio" : "Nuevo servicio"),
    [editing]
  );

  function handleCreateClick() {
    setEditing(null);
    setShowForm(true);
  }

  function handleCancel() {
    setEditing(null);
    setShowForm(false);
  }

  function handleSubmit(payload) {
    if (editing && editing.id) {
      setServices((prev) =>
        prev.map((x) => (x.id === editing.id ? { ...editing, ...payload } : x))
      );
    } else {
      const newId = `S-${String(seq).padStart(3, "0")}`;
      setSeq((n) => n + 1);
      setServices((prev) => [...prev, { ...payload, id: newId }]);
    }
    setShowForm(false);
    setEditing(null);
  }

  function handleEdit(svc) {
    setEditing(svc);
    setShowForm(true);
  }

  function handleDelete(id) {
    setServices((prev) => prev.filter((x) => x.id !== id));
  }

  // abrir diálogo de clonar
  function handleCloneOpen(svc) {
    setCloneBase(svc);
  }
  function handleCloneCancel() {
    setCloneBase(null);
  }
  // confirmar clonado: abre el form como borrador editable (ID se asigna al guardar)
  function handleCloneConfirm({ fecha, turno }) {
    const draft = {
      ...cloneBase,
      id: null,
      fecha,
      turno,
    };
    setCloneBase(null);
    setEditing(draft);
    setShowForm(true);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      {/* Header sección */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">Planificación de servicios</h1>
        <button
          onClick={handleCreateClick}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          title="Mock: aún sin backend"
        >
          Nuevo servicio
        </button>
      </div>

      {showForm && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-black">{titulo}</h2>
          <ServiceForm
            initial={editing}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        </div>
      )}

      {/* Lista / tabla */}
      <ServicesTable
        services={services}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClone={handleCloneOpen}
      />

      {/* Diálogo clonar */}
      {cloneBase && (
        <CloneDialog
          base={cloneBase}
          services={services}
          onCancel={handleCloneCancel}
          onConfirm={handleCloneConfirm}
        />
      )}
    </div>
  );
}
