"use client";
import { useEffect, useState, useRef } from "react";

export default function DriverClient() {
  const [services, setServices] = useState([]);
  const [activeService, setActiveService] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState([]); // Log visual para el chofer
  const intervalRef = useRef(null);

  // 1. Cargar servicios asignados al chofer (Mock o API real si tuvieramos filtro por chofer)
  // Para este MVP, cargaremos todos y filtraremos (idealmente el backend filtraría por session.userId)
  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        // Filtramos servicios que no estén finalizados
        const available = data.filter(s => s.estado !== 'Finalizado');
        setServices(available);
      })
      .catch(err => console.error(err));
  }, []);

  // 2. Función para enviar ubicación
  const sendLocation = (serviceId) => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          await fetch("/api/gps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: latitude,
              lng: longitude,
              servicioId: serviceId
            })
          });
          
          const time = new Date().toLocaleTimeString();
          setLogs(prev => [`Enviado: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (${time})`, ...prev.slice(0, 4)]);
        } catch (err) {
          console.error("Error enviando GPS", err);
        }
      },
      (error) => console.error("Error GPS navegador", error),
      { enableHighAccuracy: true }
    );
  };

  // 3. Manejar Inicio/Fin de viaje
  const toggleService = async (service) => {
    if (activeService?.id === service.id) {
      // DETENER
      clearInterval(intervalRef.current);
      setIsSending(false);
      setActiveService(null);
      
      // Actualizar estado a Finalizado en BD
      await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Finalizado" })
      });
      
      alert("Servicio finalizado.");
      window.location.reload(); // Recargar para limpiar lista
    } else {
      // INICIAR
      if (activeService) return alert("Ya tienes un servicio en curso.");
      
      // Actualizar estado a EnCurso en BD
      await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "EnCurso" })
      });

      setActiveService(service);
      setIsSending(true);

      // Enviar primera posición inmediatamente
      sendLocation(service.id);
      
      // Configurar intervalo cada 5 segundos
      intervalRef.current = setInterval(() => {
        sendLocation(service.id);
      }, 5000);
    }
  };

  // Limpieza al desmontar
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="mx-auto grid max-w-2xl gap-6 text-black">
      <h1 className="text-xl font-semibold">Panel de Conductor</h1>

      {/* Lista de Servicios */}
      <section className="space-y-4">
        {services.length === 0 && <p className="text-gray-500">No tienes servicios asignados hoy.</p>}
        
        {services.map(s => {
          const isActive = activeService?.id === s.id;
          return (
            <div key={s.id} className={`rounded-2xl border p-5 shadow-sm transition ${isActive ? 'border-green-500 bg-green-50' : 'bg-white'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{s.paradas[0]} → {s.paradas[s.paradas.length - 1]}</h3>
                  <p className="text-sm text-gray-600">Bus: {s.bus?.patente} • Turno: {s.turno}</p>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded mt-2 inline-block">{s.estado}</span>
                </div>
                <button
                  onClick={() => toggleService(s)}
                  className={`px-4 py-2 rounded-lg font-semibold text-white shadow 
                    ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isActive ? "Finalizar Ruta" : "Iniciar Ruta"}
                </button>
              </div>
              
              {isActive && (
                <div className="mt-4 border-t border-green-200 pt-3">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium">Transmitiendo ubicación en tiempo real...</span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono bg-white/50 p-2 rounded">
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}