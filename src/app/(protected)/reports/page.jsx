// src/app/(protected)/reports/page.jsx
"use client";
import { useState } from "react";

// Tipos de reporte disponibles
const REPORT_TYPES = ["Operacional", "Costos", "Puntualidad"];

export default function ReportsPage() {
  // Fechas por defecto (inicio de mes actual hasta hoy)
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [start, setStart] = useState(firstDay);
  const [end, setEnd] = useState(today);
  const [type, setType] = useState("Operacional");
  const [loading, setLoading] = useState(false);

  // Función para descargar el reporte desde la API
  const handleExport = async () => {
    setLoading(true);
    try {
      // Construimos la URL con parámetros
      const params = new URLSearchParams({
        from: start,
        to: end,
        type: type
      });

      const res = await fetch(`/api/reports?${params.toString()}`);
      
      if (!res.ok) {
        const text = await res.text();
        alert(`Error: ${text}`);
        return;
      }

      // Convertimos la respuesta en un Blob para descargar
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Usamos el nombre que viene en el header o generamos uno
      a.download = `trackmontt_${type.toLowerCase()}_${start}_${end}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error descargando reporte:", error);
      alert("Error de conexión al generar el reporte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6 text-black">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-xl font-semibold text-black">Generador de Reportes</h1>
      </div>

      {/* Panel de Filtros */}
      <section className="rounded-2xl border bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Selector de Rango */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">1. Rango de Fechas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Selector de Tipo */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">2. Tipo de Reporte</h3>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              {type === "Operacional" && "Incluye ocupación, pasajeros y estado de rutas."}
              {type === "Costos" && "Estimación de costos por kilómetro recorrido."}
              {type === "Puntualidad" && "Análisis de cumplimiento horario."}
            </p>
          </div>
        </div>

        {/* Botón de Acción */}
        <div className="mt-8 flex justify-end border-t pt-4">
          <button
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Descargar CSV
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}