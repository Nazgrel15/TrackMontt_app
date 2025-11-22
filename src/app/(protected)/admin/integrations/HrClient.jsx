// src/app/(protected)/admin/integrations/HrClient.jsx
"use client";
import { useState, useEffect } from "react";

export default function HrClient() {
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [start, setStart] = useState(firstDay);
  const [end, setEnd] = useState(today);
  const [areas, setAreas] = useState([]); // Lista de áreas
  const [selectedArea, setSelectedArea] = useState("Todas");
  const [loading, setLoading] = useState(false);

  // 1. Cargar áreas disponibles al montar
  useEffect(() => {
    fetch("/api/workers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Extraer áreas únicas y ordenarlas
          const uniqueAreas = [...new Set(data.map((w) => w.area).filter(Boolean))].sort();
          setAreas(uniqueAreas);
        }
      })
      .catch(console.error);
  }, []);

  const handleExport = async () => {
    setLoading(true);
    try {
      // ✨ Agregamos el parámetro de área
      const params = new URLSearchParams({ from: start, to: end, area: selectedArea });
      const res = await fetch(`/api/integrations/hr/export?${params.toString()}`);
      
      if (!res.ok) {
        const text = await res.text();
        alert(`Aviso: ${text}`);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const areaSuffix = selectedArea !== "Todas" ? `_${selectedArea.replace(/\s+/g, '')}` : "";
      a.download = `nomina_asistencia_${start}_${end}${areaSuffix}.csv`;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      alert("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-black">Exportación para Nómina (RR.HH.)</h2>
          <p className="text-sm text-gray-500">Genera un archivo compatible con sistemas de remuneraciones.</p>
        </div>
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-100 text-purple-600">
          📁
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input 
            type="date" 
            value={start} 
            onChange={(e) => setStart(e.target.value)} 
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <input 
            type="date" 
            value={end} 
            onChange={(e) => setEnd(e.target.value)} 
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black"
          />
        </div>
        
        {/* ✨ Nuevo Selector de Área */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Filtrar por Área</label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black bg-white"
          >
            <option value="Todas">Todas las áreas</option>
            {areas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleExport}
          disabled={loading}
          className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition"
        >
          {loading ? "Generando..." : "Descargar Nómina"}
        </button>
      </div>
    </div>
  );
}