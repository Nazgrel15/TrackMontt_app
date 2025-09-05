"use client";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

/* ======== Datos mock estables ======== */
// Coordenadas aprox. Puerto Montt
const INITIAL_STOPS = Object.freeze([
  { id: "S-001", nombre: "Terminal Puerto Montt", lat: -41.4710, lng: -72.9420 },
  { id: "S-002", nombre: "Planta Chincui",        lat: -41.4850, lng: -72.9550 },
  { id: "S-003", nombre: "Coyam",                 lat: -41.4878, lng: -72.9625 },
]);

/* ======== Helpers IDs ======== */
function seqFromSeed(seed) {
  const nums = seed
    .map(s => Number(String(s.id || "").split("-")[1]))
    .filter(n => !Number.isNaN(n));
  return nums.length ? Math.max(...nums) + 1 : 1;
}
function makeId(n) {
  return `S-${String(n).padStart(3, "0")}`;
}

/* ======== Validaciones ======== */
function validateStop({ nombre, lat, lng }) {
  const e = {};
  if (!nombre?.trim()) e.nombre = "El nombre es obligatorio.";
  const nlat = Number(lat), nlng = Number(lng);
  if (Number.isNaN(nlat)) e.lat = "Lat debe ser numérica.";
  if (Number.isNaN(nlng)) e.lng = "Lng debe ser numérica.";
  if (!e.lat && (nlat < -90 || nlat > 90)) e.lat = "Lat fuera de rango (-90..90).";
  if (!e.lng && (nlng < -180 || nlng > 180)) e.lng = "Lng fuera de rango (-180..180).";
  return e;
}

/* ======== Mini util para recentrar mapa ======== */
function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position, map]);
  return null;
}

/* ======== Formulario ======== */
function StopForm({ initial, onCancel, onSubmit }) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [lat, setLat]       = useState(String(initial?.lat ?? "-41.4717"));
  const [lng, setLng]       = useState(String(initial?.lng ?? "-72.9360"));
  const [errors, setErrors] = useState({});
  const stopIcon = useMemo(() => new L.Icon({
  iconUrl: "/images/stops.png",     // ruta pública (sin 'public/')
  iconSize: [32, 32],              // ajusta a tu imagen
  iconAnchor: [16, 32],            // punto que “toca” el suelo
 }), []);       
   

  const center = useMemo(
    () => [Number(lat) || -41.4717, Number(lng) || -72.9360],
    [lat, lng]
  );

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { nombre: nombre.trim(), lat: Number(lat), lng: Number(lng) };
    const err = validateStop(payload);
    setErrors(err);
    if (Object.keys(err).length) return;
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-black">Nombre</label>
          <input
            value={nombre}
            onChange={(e)=>setNombre(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Parada / punto de encuentro"
          />
          {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Lat</label>
          <input
            value={lat}
            onChange={(e)=>setLat(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="-41.47"
          />
          {errors.lat && <p className="mt-1 text-xs text-red-600">{errors.lat}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Lng</label>
          <input
            value={lng}
            onChange={(e)=>setLng(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="-72.94"
          />
          {errors.lng && <p className="mt-1 text-xs text-red-600">{errors.lng}</p>}
        </div>

        {/* Mini-mapa preview */}
        <div className="md:col-span-3">
          <div className="mb-2 text-sm text-black/60">Vista previa de ubicación</div>
          <div className="h-56 overflow-hidden rounded-xl border">
            <MapContainer center={center} zoom={14} className="h-full w-full">
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Recenter position={center} />
              <Marker position={center} icon={stopIcon} />
            </MapContainer>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm text-black hover:bg-black/5">Cancelar</button>
        <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          {initial ? "Guardar cambios" : "Crear parada"}
        </button>
      </div>
    </form>
  );
}

/* ======== Tabla ======== */
function StopsTable({ stops, onEdit, onDelete, onSearch }) {
  return (
    <div className="rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <input
          onChange={(e)=>onSearch(e.target.value)}
          placeholder="Buscar por nombre…"
          className="w-72 max-w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-black/70">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Lat</th>
              <th className="px-4 py-3">Lng</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stops.map((s) => (
              <tr key={s.id} className="odd:bg-white even:bg-slate-50/30">
                <td className="px-4 py-3">{s.id}</td>
                <td className="px-4 py-3">{s.nombre}</td>
                <td className="px-4 py-3">{s.lat}</td>
                <td className="px-4 py-3">{s.lng}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=>onEdit(s)} className="mr-2 rounded-lg border px-3 py-1 hover:bg-black/5">Editar</button>
                  <button onClick={()=>onDelete(s.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-red-700 hover:bg-red-100">Borrar</button>
                </td>
              </tr>
            ))}
            {stops.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-black/60">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======== Página cliente ======== */
export default function StopsClient() {
  const [stops, setStops]   = useState(() => [...INITIAL_STOPS]);
  const [seq, setSeq]       = useState(() => seqFromSeed(INITIAL_STOPS)); // p.ej. 4
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const list = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return stops;
    return stops.filter(s => s.nombre.toLowerCase().includes(f));
  }, [stops, filter]);

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
      setStops(prev => prev.map(s => (s.id === editing.id ? { ...editing, ...payload } : s)));
    } else {
      // Evitar duplicado por nombre + coords exactas
      const exists = stops.some(x =>
        x.nombre.toLowerCase() === payload.nombre.toLowerCase() &&
        x.lat === payload.lat && x.lng === payload.lng
      );
      if (exists) {
        alert("Ya existe una parada con ese nombre y coordenadas.");
        return;
      }
      const id = makeId(seq);
      setSeq(n => n + 1);
      setStops(prev => [...prev, { id, ...payload }]);
    }
    setShowForm(false);
    setEditing(null);
  }
  function handleEdit(s) {
    setEditing(s);
    setShowForm(true);
  }
  function handleDelete(id) {
    setStops(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">Administración — Paradas</h1>
        <button
          onClick={handleNew}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          title="Mock: sin backend aún"
        >
          Agregar parada
        </button>
      </div>

      {showForm && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-black">{editing ? "Editar parada" : "Nueva parada"}</h2>
          <StopForm initial={editing} onCancel={handleCancel} onSubmit={handleSubmit} />
        </div>
      )}

      <StopsTable stops={list} onEdit={handleEdit} onDelete={handleDelete} onSearch={setFilter} />
    </div>
  );
}
