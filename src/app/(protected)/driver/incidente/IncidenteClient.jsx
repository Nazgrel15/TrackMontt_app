// src/app/(protected)/driver/incidente/IncidenteClient.jsx
"use client";
import { useState } from "react";
import {
  AlertTriangle,
  Wrench,
  TrafficCone,
  AlertOctagon,
  Users,
  HelpCircle,
  Mic,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

const INCIDENT_TYPES = [
  { id: "mechanic", label: "Falla Mecánica", icon: Wrench },
  { id: "traffic", label: "Tráfico/Ruta", icon: TrafficCone },
  { id: "accident", label: "Accidente", icon: AlertOctagon },
  { id: "passenger", label: "Pasajero", icon: Users },
  { id: "other", label: "Otro", icon: HelpCircle },
];

export default function IncidenteClient() {
  const [selectedType, setSelectedType] = useState(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedType) return;

    setIsSubmitting(true);

    // Simulación de envío
    setTimeout(() => {
      console.log("INCIDENTE REPORTADO:", {
        tipo: selectedType,
        note,
        timestamp: new Date().toISOString(),
      });
      setSuccess(true);
      setIsSubmitting(false);
      setNote("");
      setSelectedType(null);
    }, 1000);
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 rounded-full bg-green-100 p-6">
          <div className="h-12 w-12 text-green-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">¡Reporte Enviado!</h2>
        <p className="mb-8 text-slate-600">El equipo de operaciones ha sido notificado.</p>
        <button
          onClick={() => setSuccess(false)}
          className="w-full max-w-xs rounded-xl bg-slate-900 py-4 font-semibold text-white shadow-lg active:scale-95"
        >
          Enviar otro reporte
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Encabezado de Alerta */}
      <div className="bg-red-50 px-6 py-8 text-center border-b border-red-100">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-red-900">Reportar Incidente</h1>
        <p className="mt-1 text-sm text-red-700">
          Seleccione el tipo de problema para notificar a la central
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-md p-6">
        {/* Selector de Tipo (Grid) */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          {INCIDENT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.label;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.label)}
                className={`group relative flex flex-col items-center justify-center rounded-2xl border p-6 transition-all duration-200 ${isSelected
                  ? "border-red-500 bg-red-50 ring-4 ring-red-500/30"
                  : "border-slate-200 bg-white shadow-sm hover:border-red-200 hover:bg-red-50/50"
                  }`}
              >
                <Icon
                  size={32}
                  className={`mb-3 transition-colors ${isSelected ? "text-red-600" : "text-slate-400 group-hover:text-red-500"
                    }`}
                />
                <span
                  className={`text-sm font-semibold ${isSelected ? "text-red-900" : "text-slate-600"
                    }`}
                >
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Descripción */}
        <div className="mb-8 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Detalles Adicionales
          </label>
          <div className="relative">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe qué pasó..."
              rows={4}
              className="w-full rounded-2xl border-0 bg-white p-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-red-500"
            />
            {/* Botón de Audio Simulado */}
            <button
              type="button"
              className="absolute bottom-3 right-3 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              title="Grabar audio (Próximamente)"
            >
              <Mic size={20} />
            </button>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4 pb-8 md:static md:border-0 md:bg-transparent md:p-0">
          <div className="mx-auto flex max-w-md flex-col gap-3">
            <button
              type="submit"
              disabled={!selectedType || isSubmitting}
              className={`flex w-full items-center justify-center rounded-2xl py-4 text-lg font-bold text-white shadow-xl transition-all ${!selectedType || isSubmitting
                ? "cursor-not-allowed bg-slate-300 text-slate-500 shadow-none"
                : "bg-gradient-to-r from-red-600 to-orange-600 active:scale-95 hover:shadow-red-500/25"
                }`}
            >
              {isSubmitting ? "Enviando..." : "ENVIAR REPORTE"}
            </button>

            <Link
              href="/driver"
              className="flex w-full items-center justify-center rounded-xl py-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}