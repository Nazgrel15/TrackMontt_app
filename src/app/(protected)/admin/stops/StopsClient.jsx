// src/app/(protected)/admin/stops/StopsClient.jsx
"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
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
  const [lat, setLat] = useState(String(initial?.lat ?? "-41.4717"));
  const [lng, setLng] = useState(String(initial?.lng ?? "-72.9360"));
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
      style: 'mapbox://styles/mapbox/light-v11', // Estilo más limpio
      center: [initialLng, initialLat],
      zoom: 13
    });

    // Agregar controles de navegación
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Crear marcador inicial
    marker.current = new mapboxgl.Marker({ color: '#2563eb', draggable: true }) // Azul
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
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { nombre: nombre.trim(), lat: Number(lat), lng: Number(lng) };
    const err = validateStop(payload);
    setErrors(err);
    if (Object.keys(err).length) return;
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la Parada</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
          placeholder="Ej: Plaza de Armas"
        />
        {errors.nombre && <p className="mt-1 text-xs text-red-500 font-medium">{errors.nombre}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Latitud</label>
          <input readOnly value={lat} className="w-full rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-xs font-mono text-slate-600" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Longitud</label>
          <input readOnly value={lng} className="w-full rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-xs font-mono text-slate-600" />
        </div>
      </div>

      {/* Contenedor del mapa */}
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 text-xs text-slate-500 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="font-medium">Arrastra el marcador o haz clic en el mapa para ubicar la parada</span>
        </div>
        <div
          ref={mapContainer}
          className="h-64 w-full bg-slate-100"
          style={{ position: 'relative' }}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
        >
          {initial ? "Guardar Cambios" : "Crear Parada"}
        </button>
      </div>
    </form>
  );
}

/* ======== Modal Wrapper ======== */
function StopModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">Gestión de Parada</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ======== Tabla Modernizada ======== */
function StopsTable({ stops, onEdit, onDelete, onSearch, isLoading }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="relative max-w-md">
          <input
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar parada..."
            className="w-full rounded-xl border-0 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Ubicación</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Coordenadas</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">Cargando paradas...</td></tr>}
            {!isLoading && stops.map((s) => (
              <tr key={s.id} className="group hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 ring-4 ring-white shadow-sm">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="font-bold text-slate-900">{s.nombre}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold text-slate-400">LAT</span>
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{s.lat}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold text-slate-400">LNG</span>
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{s.lng}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(s)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => onDelete(s.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && stops.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400">No se encontraron paradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======== Página Principal ======== */
export default function StopsClient() {
  const [stops, setStops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null);
  // ✨ 1. Declaramos el estado del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // ✨ 2. Funciones para abrir/cerrar Modal
  function handleNew() { 
    setEditing(null); 
    setIsModalOpen(true); // Abrir modal
  }
  
  function handleCancel() { 
    setEditing(null); 
    setIsModalOpen(false); // Cerrar modal
  }

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
      setIsModalOpen(false); // Cerrar modal al guardar
      setEditing(null);
      loadStops();
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  }

  function handleEdit(s) { 
    setEditing(s); 
    setIsModalOpen(true); // Abrir modal
  }

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
    <div className="mx-auto max-w-[1600px] p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Paradas</h1>
          <p className="text-slate-500 mt-1">Administre los puntos de interés y paradas de la ruta.</p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-[1.02] transition-all"
        >
          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva Parada
        </button>
      </div>

      <div className="flex-1 w-full overflow-hidden">
        <StopsTable stops={list} onEdit={handleEdit} onDelete={handleDelete} onSearch={setFilter} isLoading={isLoading} />
      </div>

      {/* ✨ 3. Modal para el formulario */}
      <StopModal isOpen={isModalOpen} onClose={handleCancel}>
        <StopForm initial={editing} onCancel={handleCancel} onSubmit={handleSubmit} />
      </StopModal>
    </div>
  );
}