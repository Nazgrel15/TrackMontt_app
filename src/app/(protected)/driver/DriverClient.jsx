// src/app/(protected)/driver/DriverClient.jsx
"use client";
import { useEffect, useState, useRef } from "react";

export default function DriverClient() {
  // 1. Control de montaje para evitar errores de Hidratación y Build
  const [mounted, setMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // Para reintentar carga

  // Estados
  const [services, setServices] = useState([]);
  const [activeService, setActiveService] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [search, setSearch] = useState("");

  const intervalRef = useRef(null);

  // 2. Efecto único para marcar que ya estamos en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // 3. Carga de datos (solo corre si mounted es true)
  useEffect(() => {
    if (!mounted) return;

    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");

        // Manejo robusto de errores de API
        if (!res.ok) {
          // Intentamos leer el error, si falla devolvemos objeto vacío
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error ${res.status}`);
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          const available = data.filter((s) => s.estado !== "Finalizado");
          setServices(available);

          // Restaurar servicio activo si existe en localStorage
          const savedSvcId = localStorage.getItem("tm_active_svc");
          if (savedSvcId) {
            const found = available.find((s) => s.id === savedSvcId);
            if (found) toggleService(found, true);
          }
        } else {
          console.error("Formato inválido:", data);
        }
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los servicios.");
      }
    };

    const fetchWorkers = async () => {
      try {
        const res = await fetch("/api/workers");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setWorkers(data);
          }
        }
      } catch (err) {
        console.error("Error cargando trabajadores:", err);
      }
    };

    fetchServices();
    fetchWorkers();

  }, [mounted, retryCount]); // Dependencia agregada: retryCount

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // --- Funciones auxiliares ---

  const loadAttendance = async (serviceId) => {
    try {
      const res = await fetch(`/api/attendance?serviceId=${serviceId}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const map = {};
          data.forEach((r) => (map[r.trabajadorId] = r.status));
          setAttendance(map);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendLocation = (serviceId) => {
    // Verificación extra para evitar errores si navigator no existe
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          await fetch("/api/gps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: latitude,
              lng: longitude,
              servicioId: serviceId,
            }),
          });
          const time = new Date().toLocaleTimeString();
          setLogs((prev) => [`GPS OK: ${time}`, ...prev.slice(0, 2)]);
        } catch (err) {
          console.error(err);
        }
      },
      (err) => console.error("Error GPS:", err),
      { enableHighAccuracy: true }
    );
  };

  const toggleService = async (service, isRestore = false) => {
    if (activeService?.id === service.id && !isRestore) {
      // FINALIZAR
      clearInterval(intervalRef.current);
      setIsSending(false);
      setActiveService(null);
      localStorage.removeItem("tm_active_svc");

      await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Finalizado" }),
      });

      alert("Ruta finalizada.");
      window.location.reload();
      return;
    }

    if (activeService && activeService.id !== service.id)
      return alert("Ya tienes un servicio en curso.");

    // INICIAR
    if (!isRestore) {
      await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "EnCurso" }),
      });
    }

    setActiveService(service);
    setIsSending(true);
    localStorage.setItem("tm_active_svc", service.id);

    loadAttendance(service.id);
    sendLocation(service.id);

    intervalRef.current = setInterval(() => sendLocation(service.id), 5000);
  };

  const handleCheckIn = async (workerId) => {
    if (!activeService) return;

    const newStatus =
      attendance[workerId] === "Presente" ? "Ausente" : "Presente";
    setAttendance((prev) => ({ ...prev, [workerId]: newStatus }));

    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: activeService.id,
          passengers: [{ workerId, status: newStatus }],
        }),
      });
    } catch (e) {
      alert("Error al guardar asistencia");
      setAttendance((prev) => ({
        ...prev,
        [workerId]: attendance[workerId], // Revertir
      }));
    }
  };

  const filteredWorkers = workers.filter(
    (w) =>
      w.nombre.toLowerCase().includes(search.toLowerCase()) ||
      w.rut.includes(search)
  );

  // --- RENDERIZADO SEGURO ---
  // Si no está montado en el cliente, devolvemos null.
  // Esto evita que el servidor renderice algo diferente al cliente.
  if (!mounted) {
    return (
      <div className="p-10 text-center text-gray-500">
        Cargando entorno...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md pb-24 text-slate-900">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Mi Servicio</h1>
        <p className="text-slate-500">Gestiona tu ruta y pasajeros</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex flex-col items-center gap-3">
          <div className="text-center">
            <strong className="font-bold block mb-1">Error de Conexión</strong>
            <span className="block text-sm">{error}</span>
          </div>
          <button
            onClick={() => setRetryCount(c => c + 1)}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-bold transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {!error && services.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <svg className="mb-4 h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <p className="text-slate-500">No tienes servicios asignados.</p>
        </div>
      )}

      <div className="space-y-6">
        {services.map((s) => {
          const isActive = activeService?.id === s.id;
          if (activeService && !isActive) return null;

          return (
            <div
              key={s.id}
              className={`overflow-hidden rounded-3xl bg-white shadow-xl transition-all ${isActive ? "ring-4 ring-green-500 ring-offset-2" : "border border-slate-200"
                }`}
            >
              {/* Header de la Tarjeta */}
              <div className={`p-6 ${isActive ? "bg-green-50" : "bg-white"}`}>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${isActive ? "bg-green-200 text-green-800" : "bg-slate-100 text-slate-600"
                      }`}>
                      {isActive ? "En Curso" : "Programado"}
                    </span>
                    {isActive && (
                      <div className="flex items-center gap-2 text-xs font-mono text-green-700">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        GPS ACTIVO
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-1">
                    {s.paradas[0]}
                  </h3>
                  <div className="flex items-center justify-center my-2 text-slate-400">
                    <svg className="h-6 w-6 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                    {s.paradas[s.paradas.length - 1]}
                  </h3>

                  <div className="mt-4 flex items-center gap-3 text-sm text-slate-600 bg-white/50 p-3 rounded-xl border border-slate-100">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="font-medium">{s.bus?.patente || "Sin Patente"}</span>
                    <span className="text-slate-300">|</span>
                    <span>{s.turno}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleService(s)}
                  className={`w-full rounded-2xl py-4 text-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${isActive
                    ? "bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30 hover:from-red-600 hover:to-red-700"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700"
                    }`}
                >
                  {isActive ? "Finalizar Ruta" : "Iniciar Ruta"}
                </button>
              </div>

              {/* Lista de Pasajeros */}
              {isActive && (
                <div className="border-t border-slate-100 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-900">
                      Pasajeros
                      <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-sm text-slate-700">
                        {Object.values(attendance).filter((s) => s === "Presente").length}
                      </span>
                    </h4>
                  </div>

                  <div className="relative mb-4">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      placeholder="Buscar pasajero..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    {filteredWorkers.map((w) => {
                      const isPresent = attendance[w.id] === "Presente";

                      return (
                        <div
                          key={w.id}
                          onClick={() => handleCheckIn(w.id)}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 shadow-sm transition-all active:scale-[0.98] ${isPresent
                            ? "border-green-200 bg-green-50"
                            : "border-slate-200 bg-white"
                            }`}
                        >
                          <div>
                            <div className={`font-bold text-lg ${isPresent ? "text-green-900" : "text-slate-900"}`}>
                              {w.nombre}
                            </div>
                            <div className={`text-sm ${isPresent ? "text-green-700" : "text-slate-500"}`}>
                              {w.rut} • {w.area}
                            </div>
                          </div>

                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${isPresent
                              ? "border-green-500 bg-green-500 text-white shadow-lg shadow-green-500/30"
                              : "border-slate-200 bg-slate-50 text-slate-300"
                              }`}
                          >
                            {isPresent && (
                              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {filteredWorkers.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                        <p className="text-slate-500">No se encontraron pasajeros.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}