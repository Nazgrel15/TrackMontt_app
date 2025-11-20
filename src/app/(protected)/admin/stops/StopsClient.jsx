"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl"; // Importación directa
import "mapbox-gl/dist/mapbox-gl.css";

/* ======== Validaciones ======== */
function validateStop({ nombre, lat, lng }) {
  const e = {};
  if (!nombre?.trim()) e.nombre = "El nombre es obligatorio.";
  const nlat = Number(lat), nlng = Number(lng);
  if (Number.isNaN(nlat)) e.lat = "Lat debe ser numérica.";
  if (Number.isNaN(nlng)) e.lng = "Lng debe ser numérica.";
  if (!e.lat && (nlat < -90 || nlat > 90)) e.lat = "Lat fuera de rango.";
  if (!e.lng && (nlng < -180 || nlng > 180)) e.lng = "Lng fuera de rango.";
  return e;
}

/* ======== Formulario con Mapa Nativo ======== */
function StopForm({ initial, onCancel, onSubmit }) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [lat, setLat]       = useState(String(initial?.lat ?? "-41.4717"));
  const [lng, setLng]       = useState(String(initial?.lng ?? "-72.9360"));
  const [errors, setErrors] = useState({});
  
  // Referencias para el mapa nativo
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Inicializar mapa al montar
  useEffect(() => {
    if (map.current) return; // Solo inicializar una vez
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    const initialLat = Number(lat) || -41.4717;
    const initialLng = Number(lng) || -72.9360;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLng, initialLat],
      zoom: 13
    });

    // Agregar controles de navegación
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Crear marcador inicial
    marker.current = new mapboxgl.Marker({ color: 'red', draggable: true })
      .setLngLat([initialLng, initialLat])
      .addTo(map.current);

    // Evento: Al arrastrar el marcador
    marker.current.on('dragend', () => {
      const lngLat = marker.current.getLngLat();
      setLat(lngLat.lat.toFixed(6));
      setLng(lngLat.lng.toFixed(6));
    });

    // Evento: Al hacer clic en el mapa
    map.current.on('click', (e) => {
      const { lat, lng } = e.lngLat;
      marker.current.setLngLat([lng, lat]);
      setLat(lat.toFixed(6));
      setLng(lng.toFixed(6));
    });

    // Limpieza al desmontar
    return () => {
      if (map.current) map.current.remove();
      map.current = null;
    };
  }, []); // Array vacío: solo al montar

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
          <input readOnly value={lat} className="mt-1 w-full bg-gray-50 rounded-lg border border-gray-300 px-3 py-2 text-gray-600" />
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Lng</label>
          <input readOnly value={lng} className="mt-1 w-full bg-gray-50 rounded-lg border border-gray-300 px-3 py-2 text-gray-600" />
        </div>

        {/* Contenedor del mapa */}
        <div className="md:col-span-3">
          <div className="mb-2 text-sm text-black/60">Mueve el marcador o haz clic en el mapa:</div>
          <div 
            ref={mapContainer} 
            className="h-64 w-full rounded-xl border overflow-hidden" 
            style={{ position: 'relative' }} 
          />
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

/* ======== Tabla (Igual que antes) ======== */
function StopsTable({ stops, onEdit, onDelete, onSearch, isLoading }) {
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
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Lat</th>
              <th className="px-4 py-3">Lng</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={4} className="px-4 py-6 text-center text-black/60">Cargando...</td></tr>}
            {!isLoading && stops.map((s) => (
              <tr key={s.id} className="odd:bg-white even:bg-slate-50/30">
                <td className="px-4 py-3">{s.nombre}</td>
                <td className="px-4 py-3">{s.lat}</td>
                <td className="px-4 py-3">{s.lng}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=>onEdit(s)} className="mr-2 rounded-lg border px-3 py-1 hover:bg-black/5">Editar</button>
                  <button onClick={()=>onDelete(s.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-red-700 hover:bg-red-100">Borrar</button>
                </td>
              </tr>
            ))}
            {!isLoading && stops.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-black/60">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======== Página Principal ======== */
export default function StopsClient() {
  const [stops, setStops]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Cargar datos
  const loadStops = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stops");
      if (res.ok) setStops(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadStops(); }, []);

  const list = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return stops;
    return stops.filter(s => s.nombre.toLowerCase().includes(f));
  }, [stops, filter]);

  function handleNew() { setEditing(null); setShowForm(true); }
  function handleCancel() { setEditing(null); setShowForm(false); }
  
  async function handleSubmit(payload) {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/stops/${editing.id}` : '/api/stops';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setShowForm(false);
      setEditing(null);
      loadStops();
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  }

  function handleEdit(s) { setEditing(s); setShowForm(true); }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta parada?")) return;
    try {
      const res = await fetch(`/api/stops/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      loadStops();
    } catch (err) {
      alert("Error al eliminar");
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">Administración — Paradas</h1>
        <button onClick={handleNew} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          Agregar parada
        </button>
      </div>
      {showForm && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-black">{editing ? "Editar parada" : "Nueva parada"}</h2>
          <StopForm initial={editing} onCancel={handleCancel} onSubmit={handleSubmit} />
        </div>
      )}
      <StopsTable stops={list} onEdit={handleEdit} onDelete={handleDelete} onSearch={setFilter} isLoading={isLoading} />
    </div>
  );
}