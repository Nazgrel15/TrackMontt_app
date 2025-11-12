// src/app/(protected)/auditoria/AuditoriaClient.jsx
"use client";

import { useState, useMemo } from "react";
// Importamos los mocks
import { mockAuditoria, auditActions } from "@/lib/MockData";
// Importamos las funciones CSV de los otros reportes
import { toCsv, download } from "@/lib/csvUtils"; // 👈 Crearemos este archivo

export default function AuditoriaClient() {
  const [logs, setLogs] = useState(() => [...mockAuditoria]);
  
  // AC 1: Estados de los filtros
  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("");

  // AC 1: Lógica de filtrado
  const filteredList = useMemo(() => {
    return logs.filter(log => {
      const fUser = userFilter.trim().toLowerCase();
      const fAction = actionFilter;
      const fDate = dateFilter;

      const userMatch = !fUser || log.user.toLowerCase().includes(fUser);
      const actionMatch = fAction === 'todos' || log.action === fAction;
      const dateMatch = !fDate || log.timestamp.startsWith(fDate);

      return userMatch && actionMatch && dateMatch;
    });
  }, [logs, userFilter, actionFilter, dateFilter]);

  // AC 3: Lógica de exportación
  const handleExport = () => {
    const filename = `reporte_auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    download(filename, toCsv(filteredList));
  };
  
  // Helper para formatear fecha
  const formatTimestamp = (iso) => new Date(iso).toLocaleString("es-CL");

  return (
    <div className="mx-auto grid max-w-6xl gap-6 text-black">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-black">Auditoría de Accesos y Acciones</h1>
        <button
          onClick={handleExport}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Exportar CSV
        </button>
      </div>
      
      {/* AC 1: Filtros */}
      <section className="rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-black">Filtrar por Fecha</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Filtrar por Usuario (email)</label>
            <input
              type="text"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              placeholder="kevin@trackmontt.cl"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Filtrar por Acción</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="todos">Todas las acciones</option>
              {Object.entries(auditActions).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* AC 2: Tabla de registros */}
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-black/70">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Acción</th>
              <th className="px-4 py-3">Detalles</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredList.map((log) => (
              <tr key={log.id} className="odd:bg-white even:bg-slate-50/30">
                <td className="px-4 py-3 whitespace-nowrap">{formatTimestamp(log.timestamp)}</td>
                <td className="px-4 py-3">{log.user}</td>
                <td className="px-4 py-3">{auditActions[log.action] || log.action}</td>
                <td className="px-4 py-3">{log.details}</td>
                <td className="px-4 py-3">{log.ip}</td>
              </tr>
            ))}
            {filteredList.length === 0 && (
              <tr><td colSpan="5" className="px-4 py-6 text-center text-black/60">No hay registros que coincidan con los filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}