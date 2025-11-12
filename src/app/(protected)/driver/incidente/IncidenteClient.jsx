// src/app/(protected)/driver/incidente/IncidenteClient.jsx
"use client";
import { useState } from "react";

// AC 1: Tipos de incidente
const INCIDENT_TYPES = [
  "Avería Mecánica",
  "Retraso (Tráfico)",
  "Desvío (Ruta Bloqueada)",
  "Incidente de Seguridad",
  "Otro",
];

export default function IncidenteClient() {
  const [tipo, setTipo] = useState(INCIDENT_TYPES[0]);
  const [nota, setNota] = useState("");
  // AC 2: Mock de foto (solo guardamos el nombre)
  const [foto, setFoto] = useState(null); 
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSuccess(false);
    
    // AC 3: Validación
    const err = {};
    if (!nota.trim()) {
      err.nota = "Debe agregar una nota descriptiva.";
    }
    setErrors(err);
    if (Object.keys(err).length) return;

    // AC 3: Simulación de "enviar notificación"
    console.log("INCIDENTE REPORTADO:", {
      tipo,
      nota,
      foto: foto ? foto.name : "Sin foto",
      timestamp: new Date().toISOString(),
    });
    setSuccess(true);
    
    // Limpiar formulario
    setNota("");
    setFoto(null);
    // Truco para limpiar el input de archivo
    if (document.getElementById("foto-input")) {
      document.getElementById("foto-input").value = null;
    }
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-6 text-black">
      <h1 className="text-xl font-semibold text-black">Reportar Incidente</h1>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-5 rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]"
      >
        
        {/* AC 1: Selección de tipo */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-black">Tipo de Incidente</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            {INCIDENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* AC 2: Campo nota */}
        <div>
          <label htmlFor="nota" className="block text-sm font-medium text-black">Nota / Descripción</label>
          <textarea
            id="nota"
            rows={4}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Describa brevemente lo que sucedió..."
          />
          {errors.nota && <p className="mt-1 text-xs text-red-600">{errors.nota}</p>}
        </div>
        
        {/* AC 2: Adjuntar foto (mock) */}
        <div>
          <label htmlFor="foto-input" className="block text-sm font-medium text-black">Adjuntar Foto (Opcional)</label>
          <input
            id="foto-input"
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
            className="mt-1 block w-full text-sm text-black
                       file:mr-4 file:rounded-lg file:border-0
                       file:bg-blue-50 file:px-4 file:py-2
                       file:text-sm file:font-semibold file:text-blue-700
                       hover:file:bg-blue-100"
          />
          {foto && <p className="mt-1 text-xs text-black/60">Archivo seleccionado: {foto.name}</p>}
        </div>

        {/* AC 3: Botón enviar */}
        <div className="flex items-center justify-end gap-3 border-t pt-4">
          {success && (
            <span className="text-sm text-green-600">
              ¡Reporte enviado al supervisor!
            </span>
          )}
          <button
            type="submit"
            className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Enviar Reporte
          </button>
        </div>

      </form>
    </div>
  );
}