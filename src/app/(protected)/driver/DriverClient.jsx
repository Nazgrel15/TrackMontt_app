"use client";
import { useEffect, useState, useRef } from "react";

export default function DriverClient() {
  // Evitar hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Estado
  const [services, setServices] = useState([]);
  const [activeService, setActiveService] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState([]);
  const intervalRef = useRef(null);

  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [search, setSearch] = useState("");

  // Marcar como montado
  useEffect(() => {
    setMounted(true);
  }, []);

  // Carga inicial
  useEffect(() => {
    if (!mounted) return;

    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        const available = data.filter(s => s.estado !== "Finalizado");
        setServices(available);

        const savedSvcId = localStorage.getItem("tm_active_svc");
        if (savedSvcId) {
          const found = available.find(s => s.id === savedSvcId);
          if (found) toggleService(found, true);
        }
      })
      .catch(console.error);

    fetch("/api/workers")
      .then(res => res.json())
      .then(setWorkers)
      .catch(console.error);

  }, [mounted]);

  // Cleanup
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
        const map = {};
        data.forEach((r) => (map[r.trabajadorId] = r.status));
        setAttendance(map);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendLocation = (serviceId) => {
    if (!navigator.geolocation) return;

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
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  };

  const toggleService = async (service, isRestore = false) => {
    if (activeService?.id === service.id && !isRestore) {
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
        [workerId]: attendance[workerId],
      }));
    }
  };

  const filteredWorkers = workers.filter(
    (w) =>
      w.nombre.toLowerCase().includes(search.toLowerCase()) ||
      w.rut.includes(search)
  );

  // Render seguro
  if (!mounted) {
    return (
      <div className="p-10 text-center text-gray-500">
        Cargando panel de conductor...
      </div>
    );
  }

  // --- Render real ---
  return (
    <div className="mx-auto grid max-w-2xl gap-6 text-black pb-20">
      <h1 className="text-xl font-semibold">Panel de Conductor</h1>

      {services.map((s) => {
        const isActive = activeService?.id === s.id;
        if (activeService && !isActive) return null;

        return (
          <div
            key={s.id}
            className={`rounded-2xl border shadow-sm overflow-hidden ${
              isActive ? "border-green-500" : "bg-white"
            }`}
          >
            <div className={`p-5 ${isActive ? "bg-green-50" : ""}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">
                    {s.paradas[0]} → {s.paradas[s.paradas.length - 1]}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {s.bus?.patente} • {s.turno}
                  </p>
                </div>

                <button
                  onClick={() => toggleService(s)}
                  className={`px-4 py-2 rounded-lg font-semibold text-white shadow transition
                  ${
                    isActive
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isActive ? "Finalizar" : "Iniciar"}
                </button>
              </div>

              {isActive && (
                <div className="text-xs font-mono text-green-700 flex items-center gap-2 mb-4">
                  <span className="animate-pulse">●</span>{" "}
                  {logs[0] || "Conectando GPS..."}
                </div>
              )}
            </div>

            {isActive && (
              <div className="border-t bg-white p-4">
                <h4 className="font-semibold mb-3">
                  Lista de Pasajeros (
                  {
                    Object.values(attendance).filter(
                      (s) => s === "Presente"
                    ).length
                  }
                  )
                </h4>

                <input
                  placeholder="Buscar por nombre o RUT..."
                  className="w-full p-2 border rounded-lg mb-3 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <div className="max-h-60 overflow-y-auto divide-y">
                  {filteredWorkers.map((w) => {
                    const isPresent = attendance[w.id] === "Presente";

                    return (
                      <div
                        key={w.id}
                        className="flex items-center justify-between py-3 px-1"
                      >
                        <div>
                          <div className="font-medium">{w.nombre}</div>
                          <div className="text-xs text-gray-500">
                            {w.rut} • {w.area}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCheckIn(w.id)}
                          className={`h-10 w-10 rounded-full flex items-center justify-center text-lg border transition
                          ${
                            isPresent
                              ? "bg-green-100 border-green-500 text-green-700"
                              : "bg-gray-50 border-gray-300 text-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {isPresent ? "✓" : "+"}
                        </button>
                      </div>
                    );
                  })}

                  {filteredWorkers.length === 0 && (
                    <p className="text-center py-4 text-gray-400">
                      No se encontraron trabajadores.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {!activeService && services.length === 0 && (
        <p className="text-center text-gray-500">
          No hay servicios asignados.
        </p>
      )}
    </div>
  );
}