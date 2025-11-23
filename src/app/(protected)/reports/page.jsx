// src/app/(protected)/reports/page.jsx
"use client";
import { useState } from "react";
import Papa from "papaparse";

// Tipos de reporte con metadatos para UI
const REPORT_TYPES = [
  {
    id: "Operacional",
    icon: "📊",
    title: "Reporte Operacional",
    desc: "Ocupación, pasajeros y estado de rutas."
  },
  {
    id: "Costos",
    icon: "💰",
    title: "Reporte de Costos",
    desc: "Estimación de costos por kilómetro recorrido."
  },
  {
    id: "Puntualidad",
    icon: "⏱️",
    title: "Reporte de Puntualidad",
    desc: "Análisis de cumplimiento horario y retrasos."
  },
  {
    id: "ESG (Huella CO2)",
    icon: "🌱",
    title: "Reporte ESG",
    desc: "Huella de carbono y métricas ambientales."
  }
];

export default function ReportsPage() {
  // Fechas por defecto
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [start, setStart] = useState(firstDay);
  const [end, setEnd] = useState(today);
  const [type, setType] = useState("Operacional");

  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [showTable, setShowTable] = useState(false);

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
    <div className="mx-auto max-w-[1600px] p-6 space-y-8 mb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Generador de Reportes</h1>
          <p className="text-slate-500 mt-1">Seleccione el tipo de reporte y el rango de fechas para analizar los datos.</p>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        <div className="space-y-8">

          {/* Selector de Tipo (Grid de Tarjetas) */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">1. Tipo de Reporte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {REPORT_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`relative flex flex-col items-start p-5 rounded-xl border text-left transition-all duration-200
                    ${type === t.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 hover:shadow-sm'
                    }`}
                >
                  <span className="text-3xl mb-3">{t.icon}</span>
                  <span className={`font-bold text-sm mb-1 ${type === t.id ? 'text-blue-900' : 'text-slate-900'}`}>
                    {t.title}
                  </span>
                  <span className={`text-xs leading-relaxed ${type === t.id ? 'text-blue-700' : 'text-slate-500'}`}>
                    {t.desc}
                  </span>

                  {type === t.id && (
                    <div className="absolute top-3 right-3 text-blue-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Fechas (Ticket Unificado) */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">2. Rango de Fechas</h3>
            <div className="inline-flex flex-col sm:flex-row bg-slate-50 rounded-xl border border-slate-200 p-1.5 shadow-sm">
              <div className="relative group px-2">
                <label className="absolute -top-2.5 left-3 bg-slate-50 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">Desde</label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="block w-full sm:w-48 border-0 bg-transparent py-2.5 pl-2 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm font-medium"
                />
              </div>
              <div className="hidden sm:flex items-center justify-center px-2 text-slate-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
              <div className="relative group px-2 border-t sm:border-t-0 sm:border-l border-slate-200">
                <label className="absolute -top-2.5 left-3 bg-slate-50 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">Hasta</label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="block w-full sm:w-48 border-0 bg-transparent py-2.5 pl-2 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm font-medium"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Botones de Acción */}
        <div className="mt-10 flex flex-col sm:flex-row justify-end gap-4 border-t border-slate-100 pt-6">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Procesando..." : (
              <>
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Visualizar Datos
              </>
            )}
          </button>

          <button
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-700 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Descargar Reporte CSV
          </button>
        </div>
      </section>

      {/* ✨ TABLA DE VISUALIZACIÓN ✨ */}
      {showTable && previewData.length > 0 && (
        <section className="rounded-2xl border border-slate-100 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586l2.828 2.828a1 1 0 01.586 1.414V19a2 2 0 01-2 2z" /></svg>
              </span>
              <h3 className="font-bold text-slate-900">Vista Previa <span className="font-normal text-slate-500">({previewData.length} registros)</span></h3>
            </div>
            <button onClick={() => setShowTable(false)} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">CERRAR VISTA</button>
          </div>

          <div className="overflow-x-auto max-h-[600px]">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                <tr>
                  {Object.keys(previewData[0]).map((header) => (
                    <th key={header} className="px-6 py-4 whitespace-nowrap bg-slate-50">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    {Object.values(row).map((val, i) => {
                      // Detectar si es numérico para usar fuente mono
                      const isNumeric = !isNaN(parseFloat(val)) && isFinite(val);
                      return (
                        <td key={i} className={`px-6 py-3 whitespace-nowrap text-slate-700 ${isNumeric ? 'font-mono text-right' : ''}`}>
                          {val}
                        </td>
                      );
                    })}
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