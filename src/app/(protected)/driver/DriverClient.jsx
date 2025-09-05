"use client";
import { useEffect, useMemo, useState } from "react";

/** ======== Servicio mock del día ========
 * Mantén valores deterministas para evitar hydration mismatch.
 * Si quieres usar la fecha actual, la mostramos solo tras mount.
 */
const MOCK_SERVICE = Object.freeze({
  fecha: "2025-09-06",
  horaInicio: "06:30",
  ruta: "C-02 — Coyam → Planta Chincui",
  bus: "B-02",
  chofer: "Tú",
  paradas: [
    { nombre: "Coyam", hora: "06:30" },
    { nombre: "Angelmo", hora: "06:45" },
    { nombre: "Planta Chincui", hora: "07:10" },
  ],
});

export default function DriverHome() {
  const [mounted, setMounted] = useState(false);
  const storageKey = useMemo(
    () => `tm_driver_service_started_${MOCK_SERVICE.fecha}`,
    []
  );
  const [startedAt, setStartedAt] = useState(null);

  // Leer estado desde localStorage solo en cliente
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setStartedAt(raw);
    } catch {}
  }, [storageKey]);

  function handleStart() {
    // Marca como iniciado y persiste
    const ts = new Date().toISOString();
    try {
      localStorage.setItem(storageKey, ts);
    } catch {}
    setStartedAt(ts);
  }

  const started = mounted && !!startedAt;

  return (
    <div className="mx-auto grid max-w-4xl gap-6 text-black">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mi servicio de hoy</h1>
        {mounted && started ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            En marcha
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
            Pendiente
          </span>
        )}
      </div>

      {/* Tarjeta principal */}
      <section className="rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-black/60">Fecha</div>
            <div className="text-base font-medium">{MOCK_SERVICE.fecha}</div>
          </div>
          <div>
            <div className="text-sm text-black/60">Hora de inicio</div>
            <div className="text-base font-medium">{MOCK_SERVICE.horaInicio}</div>
          </div>
          <div>
            <div className="text-sm text-black/60">Ruta</div>
            <div className="text-base font-medium">{MOCK_SERVICE.ruta}</div>
          </div>
          <div>
            <div className="text-sm text-black/60">Bus asignado</div>
            <div className="text-base font-medium">{MOCK_SERVICE.bus}</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-medium text-black">Paradas</div>
          <ul className="mt-2 divide-y rounded-xl border">
            {MOCK_SERVICE.paradas.map((p) => (
              <li key={p.nombre} className="flex items-center justify-between px-4 py-3">
                <span className="font-medium">{p.nombre}</span>
                <span className="text-sm text-black/60">{p.hora}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-black/60">
            {mounted && started
              ? `Inicio registrado: ${new Date(startedAt).toLocaleTimeString()}`
              : "Presiona el botón para iniciar."}
          </div>
          <button
            onClick={handleStart}
            disabled={mounted && started}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white 
              ${started ? "bg-green-600 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"}`}
          >
            {started ? "En marcha" : "Iniciar servicio"}
          </button>
        </div>
      </section>
    </div>
  );
}
