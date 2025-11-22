// src/app/(protected)/auditoria/AuditoriaClient.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { toCsv, download } from "@/lib/csvUtils";

// Mapeo de acciones a texto legible (opcional)
const actionLabels = {
  'login:success': 'Inicio de Sesión',
  'update:settings': 'Cambio de Configuración',
  'update:fleet': 'Gestión de Flota',
  'create:service': 'Creación de Servicio',
  // ... otros códigos que definas
};

export default function AuditoriaClient() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("");

  // 1. Cargar datos reales
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/audit");
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // 2. Filtrado en cliente
  const filteredList = useMemo(() => {
    return logs.filter(log => {
      const fUser = userFilter.trim().toLowerCase();
      const fAction = actionFilter;
      const fDate = dateFilter;
      
      // Comparar fechas (YYYY-MM-DD)
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];

      const userMatch = !fUser || log.user.toLowerCase().includes(fUser);
      const actionMatch = fAction === 'todos' || log.action === fAction;
      const dateMatch = !fDate || logDate === fDate;

      return userMatch && actionMatch && dateMatch;
    });
  }, [logs, userFilter, actionFilter, dateFilter]);

  const handleExport = () => {
    const filename = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    download(filename, toCsv(filteredList));
  };
  
  const formatTimestamp = (iso) => new Date(iso).toLocaleString("es-CL");

  // Obtener lista única de acciones para el select
  const uniqueActions = [...new Set(logs.map(l => l.action))];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 text-black">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-black">Auditoría de Accesos y Acciones</h1>
        <button
          onClick={handleExport}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Exportar CSV
        </button>
      </div>
      
      {/* Filtros */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-black">Filtrar por Fecha</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Filtrar por Usuario</label>
            <input
              type="text"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              placeholder="ej. admin@trackmontt.cl"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Filtrar por Acción</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="todos">Todas las acciones</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>{actionLabels[act] || act}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
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
            {loading && <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">Cargando logs...</td></tr>}
            
            {!loading && filteredList.length === 0 && (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No hay registros.</td></tr>
            )}

            {filteredList.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatTimestamp(log.timestamp)}</td>
                <td className="px-4 py-3 font-medium">{log.user}</td>
                <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono border border-slate-200">
                        {actionLabels[log.action] || log.action}
                    </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{log.details}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}