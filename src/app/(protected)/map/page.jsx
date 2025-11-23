// src/app/(protected)/map/page.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapPage() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});
  const [fleetData, setFleetData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // 1. Inicializar Mapa
  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // Estilo más limpio y moderno
      center: [-72.9360, -41.4717], // Puerto Montt
      zoom: 12.5,
      pitch: 45, // Inclinación para efecto 3D
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
  }, [MAPBOX_TOKEN]);

  // 2. Polling y Actualización
  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const res = await fetch("/api/gps/latest");
        if (!res.ok) return;
        const fleet = await res.json();

        setFleetData(fleet);
        setLastUpdate(new Date().toLocaleTimeString());

        // Actualizar marcadores
        fleet.forEach(vehicle => {
          const { servicioId, lat, lng, busPatente } = vehicle;

          if (markersRef.current[servicioId]) {
            markersRef.current[servicioId].setLngLat([lng, lat]);
          } else {
            // Marcador Personalizado
            const el = document.createElement('div');
            el.className = 'marker-bus group cursor-pointer';
            el.innerHTML = `
              <div class="relative flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110">
                <span class="text-white text-xs font-bold">🚌</span>
                <div class="absolute -bottom-1 w-2 h-2 bg-blue-600 rotate-45"></div>
              </div>
            `;

            const marker = new mapboxgl.Marker(el)
              .setLngLat([lng, lat])
              .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: false, className: 'modern-popup' }).setHTML(`
                <div class="p-2 min-w-[120px]">
                  <h3 class="font-bold text-slate-900">${busPatente}</h3>
                  <p class="text-xs text-slate-500">${vehicle.ruta}</p>
                </div>
              `))
              .addTo(map.current);

            // Hover para mostrar popup
            el.addEventListener('mouseenter', () => marker.getPopup().addTo(map.current));
            el.addEventListener('mouseleave', () => marker.getPopup().remove());

            markersRef.current[servicioId] = marker;
          }
        });

      } catch (e) {
        console.error("Error polling flota:", e);
      }
    };

    const intervalId = setInterval(fetchFleet, 5000);
    fetchFleet();

    return () => clearInterval(intervalId);
  }, []);

  const flyToBus = (lat, lng) => {
    map.current?.flyTo({ center: [lng, lat], zoom: 15, speed: 1.2 });
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-100">

      {/* Mapa Fullscreen */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Panel Flotante */}
      <div className={`absolute top-4 left-4 z-10 flex flex-col gap-2 transition-all duration-300 ${isPanelOpen ? 'w-80' : 'w-12'}`}>

        {/* Toggle Button (Mobile/Desktop) */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="self-start rounded-xl bg-white/90 p-3 shadow-lg backdrop-blur-md hover:bg-white transition-colors border border-white/20 text-slate-600"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isPanelOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Panel Content */}
        {isPanelOpen && (
          <div className="flex max-h-[calc(100vh-140px)] flex-col rounded-2xl bg-white/90 shadow-2xl backdrop-blur-md border border-white/20 overflow-hidden animate-in slide-in-from-left-4 fade-in duration-300">

            {/* Header */}
            <div className="border-b border-slate-100 p-4 bg-white/50">
              <h2 className="text-lg font-bold text-slate-900">Flota en Vivo</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {lastUpdate ? `Actualizado: ${lastUpdate}` : "Conectando..."}
                </span>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {fleetData.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-400">
                  No hay buses activos en este momento.
                </div>
              ) : (
                fleetData.map((bus) => (
                  <div
                    key={bus.servicioId}
                    onClick={() => flyToBus(bus.lat, bus.lng)}
                    className="group flex items-center gap-3 rounded-xl p-3 hover:bg-blue-50/80 cursor-pointer transition-all border border-transparent hover:border-blue-100"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{bus.busPatente}</h3>
                      <p className="text-xs text-slate-500">{bus.ruta}</p>
                    </div>
                    <div className="ml-auto">
                      <svg className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Stats */}
            <div className="bg-slate-50/80 p-3 text-center border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500">
                {fleetData.length} unidades operativas
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}