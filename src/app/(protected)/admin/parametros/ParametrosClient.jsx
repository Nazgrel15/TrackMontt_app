"use client";
import { useState } from "react";

// Datos mock iniciales para los parámetros
const INITIAL_SETTINGS = Object.freeze({
  toleranciaRetraso: 15,
  ventanaInicio: "05:00",
  ventanaFin: "23:00",
  retencionDatos: 90,
  factorCO2: 2.67, // (ej. kg CO2 por litro de combustible)
});

export default function ParametrosClient() {
  const [tolerancia, setTolerancia] = useState(INITIAL_SETTINGS.toleranciaRetraso);
  const [vInicio, setVInicio]       = useState(INITIAL_SETTINGS.ventanaInicio);
  const [vFin, setVFin]             = useState(INITIAL_SETTINGS.ventanaFin);
  const [retencion, setRetencion]   = useState(INITIAL_SETTINGS.retencionDatos);
  const [factorCO2, setFactorCO2]   = useState(INITIAL_SETTINGS.factorCO2);
  const [errors, setErrors]         = useState({}); // (Opcional, para validaciones)

  function handleSubmit(e) {
    e.preventDefault();
    // Aquí iría la lógica para guardar en la base de datos.
    // Por ahora, solo mostramos una alerta (igual que tus otros mocks).
    const payload = { tolerancia, vInicio, vFin, retencion, factorCO2 };
    console.log("Guardando parámetros:", payload);
    alert("Parámetros guardados (mock). Revisa la consola.");
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">Administración — Parámetros</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        
        <div>
          <h2 className="text-lg font-medium text-black">Reglas Operacionales</h2>
          <p className="text-sm text-black/60">Define el comportamiento general de los servicios.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Tolerancia de retraso */}
          <div>
            <label className="block text-sm font-medium text-black">Tolerancia de retraso (minutos)</label>
            <input
              type="number"
              value={tolerancia}
              onChange={(e) => setTolerancia(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: 15"
            />
            {errors.tolerancia && <p className="mt-1 text-xs text-red-600">{errors.tolerancia}</p>}
          </div>

          {/* Retención de datos */}
          <div>
            <label className="block text-sm font-medium text-black">Retención de datos (días)</label>
            <input
              type="number"
              value={retencion}
              onChange={(e) => setRetencion(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: 90"
            />
            {errors.retencion && <p className="mt-1 text-xs text-red-600">{errors.retencion}</p>}
          </div>

          {/* Ventana de Inicio */}
          <div>
            <label className="block text-sm font-medium text-black">Ventana Horaria (Inicio)</label>
            <input
              type="time"
              value={vInicio}
              onChange={(e) => setVInicio(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.vInicio && <p className="mt-1 text-xs text-red-600">{errors.vInicio}</p>}
          </div>

          {/* Ventana de Fin */}
          <div>
            <label className="block text-sm font-medium text-black">Ventana Horaria (Fin)</label>
            <input
              type="time"
              value={vFin}
              onChange={(e) => setVFin(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.vFin && <p className="mt-1 text-xs text-red-600">{errors.vFin}</p>}
          </div>
        </div>

        <hr/>
        
        <div>
          <h2 className="text-lg font-medium text-black">Sostenibilidad</h2>
          <p className="text-sm text-black/60">Parámetros para reportes de huella de carbono.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Factor CO2 */}
          <div>
            <label className="block text-sm font-medium text-black">Factor de emisión CO₂</label>
            <input
              type="number"
              step="0.01"
              value={factorCO2}
              onChange={(e) => setFactorCO2(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: 2.67"
            />
            {errors.factorCO2 && <p className="mt-1 text-xs text-red-600">{errors.factorCO2}</p>}
          </div>
        </div>


        {/* Botón de Guardar */}
        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <button type="submit" className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}