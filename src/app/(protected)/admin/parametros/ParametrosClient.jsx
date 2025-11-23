// src/app/(protected)/admin/parametros/ParametrosClient.jsx
"use client";
import { useState, useEffect } from "react";

export default function ParametrosClient() {
  const [tolerancia, setTolerancia] = useState(15);
  const [retencion, setRetencion] = useState(90);
  const [factorCO2, setFactorCO2] = useState(2.67);
  const [vInicio, setVInicio] = useState("06:00");
  const [vFin, setVFin] = useState("23:00");

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
        ventanaInicio: vInicio,
        ventanaFin: vFin
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

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Cargando configuración...</div>;

  return (
    <div className="mx-auto max-w-4xl pb-32">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configuración del Sistema</h1>
        <p className="text-slate-500 mt-2 text-lg">Ajusta los parámetros operativos y reglas de negocio globales.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Sección: Reglas Operacionales */}
        <section className="rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
          <div className="mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Reglas Operacionales</h2>
              <p className="text-sm text-slate-500">Define el comportamiento general de los servicios y alertas.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">

            {/* Tolerancia */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Tolerancia de retraso</label>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={tolerancia}
                    onChange={(e) => setTolerancia(Number(e.target.value))}
                    className="w-full bg-transparent text-slate-900 font-bold outline-none text-lg"
                  />
                  <span className="text-sm font-medium text-slate-400">min</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={tolerancia}
                  onChange={(e) => setTolerancia(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <p className="mt-2 text-xs text-blue-500 font-medium">ℹ️ Tiempo permitido antes de marcar un servicio como retrasado.</p>
            </div>

            {/* Retención */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Retención de datos</label>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={retencion}
                    onChange={(e) => setRetencion(Number(e.target.value))}
                    className="w-full bg-transparent text-slate-900 font-bold outline-none text-lg"
                  />
                  <span className="text-sm font-medium text-slate-400">días</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="365"
                  value={retencion}
                  onChange={(e) => setRetencion(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <p className="mt-2 text-xs text-blue-500 font-medium">ℹ️ Período de tiempo que el historial operativo estará disponible.</p>
            </div>

            {/* Ventana Horaria */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-3">Ventana Operativa</label>
              <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">Inicio</span>
                  <input
                    type="time"
                    value={vInicio}
                    onChange={(e) => setVInicio(e.target.value)}
                    className="w-full pl-16 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>

                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">Fin</span>
                  <input
                    type="time"
                    value={vFin}
                    onChange={(e) => setVFin(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-blue-500 font-medium">ℹ️ Define el horario estándar de operación para reportes y alertas.</p>
            </div>

          </div>
        </section>

        {/* Sección: Sostenibilidad */}
        <section className="rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
          <div className="mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Sostenibilidad</h2>
              <p className="text-sm text-slate-500">Parámetros para cálculo de huella de carbono.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Factor de emisión CO₂</label>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  <input
                    type="number"
                    step="0.01"
                    value={factorCO2}
                    onChange={(e) => setFactorCO2(e.target.value)}
                    className="w-full bg-transparent text-slate-900 font-bold outline-none text-lg"
                  />
                  <span className="text-sm font-medium text-slate-400">kg/L</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-blue-500 font-medium">ℹ️ Factor utilizado para calcular las emisiones basadas en el consumo de combustible.</p>
            </div>
          </div>
        </section>

        {/* Barra de Acción Sticky */}
        <div className="fixed bottom-6 right-6 z-20">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-blue-600/50 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
          >
            {saving ? (
              <>
                <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}