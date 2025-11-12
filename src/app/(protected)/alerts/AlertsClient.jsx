// src/app/(protected)/alertas/AlertasClient.jsx
"use client";

import { useState, useMemo } from "react";
// Importamos los datos mock que creamos en el Paso 1
import { mockAlerts, alertTypes } from "@/lib/MockData";

// --- Mapeo de estilos (Tailwind) ---

// AC 1: Severidad (rojo/amarillo/verde)
const severityClasses = {
  rojo: "bg-red-100 text-red-800 border-red-300",
  amarillo: "bg-yellow-100 text-yellow-800 border-yellow-300",
  verde: "bg-green-100 text-green-800 border-green-300",
};

// AC 2: Estado (Pendiente, En proceso, Cerrada)
const statusClasses = {
  Pendiente: "bg-gray-200 text-gray-800",
  "En proceso": "bg-blue-200 text-blue-800",
  Cerrada: "bg-green-200 text-green-800",
};

export default function AlertsClient() {
  // AC 3: Lógica para filtrar por tipo
  const [filterType, setFilterType] = useState("todos");

  const filteredAlerts = useMemo(() => {
    if (filterType === "todos") {
      return mockAlerts;
    }
    return mockAlerts.filter((alert) => alert.type === filterType);
  }, [filterType]);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 text-black">
      <h1 className="text-xl font-semibold text-black">Bandeja de Alertas</h1>

      {/* AC 3: Filtro */}
      <div className="rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <label htmlFor="filterType" className="block text-sm font-medium text-black">
          Filtrar por tipo de incidente:
        </label>
        <select
          id="filterType"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2
                     focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="todos">Todos los tipos</option>
          {Object.entries(alertTypes).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {/* AC 1 y 2: Lista/Tabla de Alertas */}
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <table className="min-w-full text-sm text-black">
          <thead className="bg-slate-50 text-left text-black/70">
            <tr>
              <th className="px-4 py-3">Severidad</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Mensaje</th>
              <th className="px-4 py-3">Hora</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredAlerts.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-black/60">
                  Sin resultados para el filtro aplicado.
                </td>
              </tr>
            )}
            
            {filteredAlerts.map((alert) => (
              // AC 1: Color de fondo según severidad
              <tr key={alert.id} className={severityClasses[alert.severity]}>
                
                <td className="px-4 py-3">
                  <span className={`inline-block h-3 w-3 rounded-full ${severityClasses[alert.severity].replace('text-', 'bg-').replace('100', '500')}`}></span>
                </td>
                
                <td className="px-4 py-3 font-medium">
                  {alertTypes[alert.type] || alert.type}
                </td>
                
                {/* AC 2: Estado (Badge) */}
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[alert.status]}`}>
                    {alert.status}
                  </span>
                </td>

                <td className="px-4 py-3">{alert.message}</td>

                <td className="px-4 py-3">
                  {new Date(alert.timestamp).toLocaleTimeString("es-CL", { timeStyle: "short" })}
                </td>

                <td className="px-4 py-3 text-right">
                  <button className="rounded-lg border border-black/10 bg-white px-3 py-1 text-sm text-black hover:bg-black/5">
                    Gestionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}