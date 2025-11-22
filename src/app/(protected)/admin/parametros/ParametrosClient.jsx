// src/app/(protected)/admin/parametros/ParametrosClient.jsx
"use client";
import { useState, useEffect } from "react";

export default function ParametrosClient() {
  const [tolerancia, setTolerancia] = useState(15);
  const [retencion, setRetencion]   = useState(90);
  const [factorCO2, setFactorCO2]   = useState(2.67);
  const [vInicio, setVInicio]       = useState("06:00");
  const [vFin, setVFin]             = useState("23:00");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setTolerancia(data.toleranciaRetraso);
          setRetencion(data.retencionDatosDias);
          setFactorCO2(data.factorCO2);
          // ✨ Cargamos valores reales de BD
          if (data.ventanaInicio) setVInicio(data.ventanaInicio);
          if (data.ventanaFin) setVFin(data.ventanaFin);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        toleranciaRetraso: tolerancia,
        retencionDatosDias: retencion,
        factorCO2: factorCO2,
        ventanaInicio: vInicio, // ✨ Enviamos
        ventanaFin: vFin        // ✨ Enviamos
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("¡Parámetros actualizados correctamente!");
      } else {
        alert("Error al guardar.");
      }
    } catch (error) {
      alert("Error de conexión.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando configuración...</div>;

  return (
    <div className="mx-auto grid max-w-4xl gap-6 text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">Administración — Parámetros</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
        
        <div>
          <h2 className="text-lg font-medium text-black">Reglas Operacionales</h2>
          <p className="text-sm text-gray-500">Define el comportamiento general de los servicios y alertas.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* ... Inputs de Tolerancia y Retención siguen igual ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tolerancia de retraso (minutos)</label>
            <input type="number" min="0" value={tolerancia} onChange={(e) => setTolerancia(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Retención de datos (días)</label>
            <input type="number" min="30" value={retencion} onChange={(e) => setRetencion(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          {/* ✨ Inputs Ventanas Horarias (YA NO DESHABILITADOS) ✨ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inicio Operación</label>
            <input 
              type="time" 
              value={vInicio} 
              onChange={(e)=>setVInicio(e.target.value)} 
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fin Operación</label>
            <input 
              type="time" 
              value={vFin} 
              onChange={(e)=>setVFin(e.target.value)} 
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>

        {/* ... Resto del formulario (CO2 y Botón) igual ... */}
        <hr className="border-gray-100"/>
        <div>
          <h2 className="text-lg font-medium text-black">Sostenibilidad</h2>
          <p className="text-sm text-gray-500">Parámetros para cálculo de huella de carbono.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Factor de emisión CO₂ (kg/L)</label>
            <input type="number" step="0.01" value={factorCO2} onChange={(e) => setFactorCO2(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <button type="submit" disabled={saving} className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 transition">
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}