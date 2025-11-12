// src/app/(protected)/asistencia/AsistenciaClient.jsx
"use client";

import { useState, useMemo } from "react";
// Importamos los mocks
import { mockAsistencia, attendanceStatus } from "@/lib/MockData";

// --- (AC 3) Funciones de exportación (copiadas de ReportsPage) ---
function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const headLine = headers.join(",");
  const body = rows
    .map((r) =>
      headers
        .map((h) => {
          const val = r[h] ?? "";
          const str = String(val).replaceAll('"', '""');
          return /[",\n]/.test(str) ? `"${str}"` : str;
        })
        .join(",")
    )
    .join("\n");
  return `${headLine}\n${body}`;
}

function download(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
// --- Fin de funciones de exportación ---


export default function AsistenciaClient() {
  const [asistencia, setAsistencia] = useState(() => [...mockAsistencia]);
  const [filter, setFilter] = useState("");

  const filteredList = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return asistencia;
    return asistencia.filter(a =>
      a.workerName.toLowerCase().includes(f) ||
      a.workerRut.toLowerCase().includes(f) ||
      a.serviceId.toLowerCase().includes(f)
    );
  }, [asistencia, filter]);

  // AC 2: Lógica para editar estado
  const handleStatusChange = (asistenciaId, newStatus) => {
    setAsistencia(prev =>
      prev.map(item =>
        item.id === asistenciaId ? { ...item, status: newStatus } : item
      )
    );
    // (Aquí iría el fetch PUT al backend en el futuro)
    console.log(`Cambiando ID ${asistenciaId} a estado ${newStatus}`);
  };

  // AC 3: Lógica de exportación
  const handleExport = () => {
    const filename = `reporte_asistencia_${new Date().toISOString().split('T')[0]}.csv`;
    download(filename, toCsv(filteredList));
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 text-black">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-black">Control de Asistencia</h1>
        <button
          onClick={handleExport}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Exportar CSV
        </button>
      </div>
      
      {/* Filtro y Tabla */}
      <div className="rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <input
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar por servicio, nombre o RUT…"
            className="w-72 max-w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        {/* AC 1: Tabla de asistencia */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-black/70">
              <tr>
                <th className="px-4 py-3">Servicio</th>
                <th className="px-4 py-3">RUT Trabajador</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Check-In</th>
                <th className="px-4 py-3">Estado (Editable)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredList.map((item) => (
                <tr key={item.id} className="odd:bg-white even:bg-slate-50/30">
                  <td className="px-4 py-3">{item.serviceId}</td>
                  <td className="px-4 py-3">{item.workerRut}</td>
                  <td className="px-4 py-3">{item.workerName}</td>
                  <td className="px-4 py-3">{item.checkIn || "---"}</td>
                  
                  {/* AC 2: Editar estado */}
                  <td className="px-4 py-3">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="w-full max-w-[150px] rounded-lg border border-gray-300 px-3 py-1.5 
                                 focus:border-blue-500 focus:ring-blue-500"
                    >
                      {attendanceStatus.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-6 text-center text-black/60">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}