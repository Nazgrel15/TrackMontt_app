"use client";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapPage() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({}); // Guardar referencias a los marcadores por ID de servicio
  const [lastUpdate, setLastUpdate] = useState(null);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // 1. Inicializar Mapa
  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-72.9360, -41.4717], // Puerto Montt
      zoom: 12
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  }, [MAPBOX_TOKEN]);

  // 2. Polling: Consultar API cada 5 segundos
  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const res = await fetch("/api/gps/latest");
        if (!res.ok) return;
        const fleet = await res.json();
        
        setLastUpdate(new Date().toLocaleTimeString());

        // Actualizar marcadores
        fleet.forEach(vehicle => {
          const { servicioId, lat, lng, busPatente } = vehicle;

          if (markersRef.current[servicioId]) {
            // Si ya existe, moverlo (animación suave nativa de Mapbox)
            markersRef.current[servicioId].setLngLat([lng, lat]);
          } else {
            // Si no existe, crearlo
            const el = document.createElement('div');
            el.className = 'marker-bus';
            el.style.backgroundColor = '#3b82f6';
            el.style.width = '30px';
            el.style.height = '30px';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.innerHTML = '🚌'; // Icono simple

            const marker = new mapboxgl.Marker(el)
              .setLngLat([lng, lat])
              .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <strong>${busPatente}</strong><br>
                ${vehicle.ruta}<br>
                <small>Actualizado: ${new Date(vehicle.timestamp).toLocaleTimeString()}</small>
              `))
              .addTo(map.current);

            markersRef.current[servicioId] = marker;
          }
        });

      } catch (e) {
        console.error("Error polling flota:", e);
      }
    };

    const intervalId = setInterval(fetchFleet, 5000); // Cada 5 seg
    fetchFleet(); // Primera carga inmediata

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="mx-auto h-[85vh] w-full max-w-7xl flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-black">Monitoreo de Flota en Vivo</h1>
        {lastUpdate && <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full animate-pulse">● En vivo ({lastUpdate})</span>}
      </div>
      
      <div className="flex-1 rounded-2xl border shadow-sm overflow-hidden relative">
         <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
}