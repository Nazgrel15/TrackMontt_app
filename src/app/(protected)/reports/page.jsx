// src/app/(protected)/reports/page.jsx
"use client";
import { useState } from "react";
import Papa from "papaparse"; // 👈 Importamos para leer el CSV

// Tipos de reporte disponibles
const REPORT_TYPES = ["Operacional", "Costos", "Puntualidad", "ESG (Huella CO2)"];

export default function ReportsPage() {
  // Fechas por defecto
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [start, setStart] = useState(firstDay);
  const [end, setEnd] = useState(today);
  const [type, setType] = useState("Operacional");
  
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]); // 👈 Datos para la tabla
  const [showTable, setShowTable] = useState(false);  // 👈 Control de visibilidad

  // Función auxiliar para obtener la URL
  const getReportUrl = () => {
    const params = new URLSearchParams({ from: start, to: end, type: type });
    if (type === "ESG (Huella CO2)") return `/api/reports/esg?${params.toString()}`;
    return `/api/reports?${params.toString()}`;
  };

  // 1. VISUALIZAR EN PANTALLA
  const handlePreview = async () => {
    setLoading(true);
    setShowTable(false);
    setPreviewData([]);

    try {
      const res = await fetch(getReportUrl());
      
      if (!res.ok) {
        const text = await res.text();
        alert(`Aviso: ${text}`);
        return;
      }

      const csvText = await res.text();

      // Usamos PapaParse para convertir CSV texto -> JSON Array
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setPreviewData(results.data);
          setShowTable(true);
        },
        error: (err) => {
          console.error("Error parsing CSV:", err);
          alert("Error al procesar los datos para visualización.");
        }
      });

    } catch (error) {
      console.error("Error visualizando reporte:", error);
      alert("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  // 2. DESCARGAR ARCHIVO
  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(getReportUrl());
      
      if (!res.ok) {
        const text = await res.text();
        alert(`Aviso: ${text}`);
        return;
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `trackmontt_${type.toLowerCase().replace(/\s+/g, '_')}_${start}_${end}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error("Error descargando reporte:", error);
      alert("Error de conexión al generar el reporte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 text-black mb-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-xl font-semibold text-black">Generador de Reportes</h1>
      </div>

      <section className="rounded-2xl border bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Filtros de Fecha */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">1. Rango de Fechas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
                <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
                <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Filtro de Tipo */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">2. Tipo de Reporte</h3>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500">
              {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <p className="text-xs text-gray-500 min-h-[2.5em]">
              {type === "Operacional" && "Incluye ocupación, pasajeros y estado de rutas."}
              {type === "Costos" && "Estimación de costos por kilómetro recorrido."}
              {type === "Puntualidad" && "Análisis de cumplimiento horario."}
              {type === "ESG (Huella CO2)" && "Cálculo de emisiones basado en factor configurado y km."}
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-8 flex justify-end gap-3 border-t pt-4">
          
          {/* Botón Visualizar */}
          <button
            onClick={handlePreview}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Cargando..." : (
              <>
                <span className="text-lg">👁️</span> Visualizar
              </>
            )}
          </button>

          {/* Botón Descargar */}
          <button
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Descargar CSV
          </button>
        </div>
      </section>

      {/* ✨ TABLA DE VISUALIZACIÓN ✨ */}
      {showTable && previewData.length > 0 && (
        <section className="rounded-2xl border bg-white shadow-sm overflow-hidden animate-fade-in-up">
           <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-black">Vista Previa del Reporte ({previewData.length} registros)</h3>
              <button onClick={() => setShowTable(false)} className="text-xs text-gray-500 hover:text-red-600 underline">Ocultar</button>
           </div>
           
           <div className="overflow-x-auto max-h-[500px]">
             <table className="min-w-full text-sm text-left">
               <thead className="bg-slate-100 text-gray-600 font-medium sticky top-0 z-10 shadow-sm">
                 <tr>
                   {Object.keys(previewData[0]).map((header) => (
                     <th key={header} className="px-4 py-3 whitespace-nowrap">{header}</th>
                   ))}
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {previewData.map((row, idx) => (
                   <tr key={idx} className="hover:bg-slate-50/80">
                     {Object.values(row).map((val, i) => (
                       <td key={i} className="px-4 py-3 whitespace-nowrap text-gray-700">{val}</td>
                     ))}
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </section>
      )}
    </div>
  );
}