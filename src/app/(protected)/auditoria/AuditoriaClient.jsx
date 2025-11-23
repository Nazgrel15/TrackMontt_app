// src/app/(protected)/auditoria/AuditoriaClient.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { toCsv, download } from "@/lib/csvUtils";

// Mapeo de acciones a texto legible y colores
const ACTION_CONFIG = {
  'login:success': { label: 'Inicio de Sesión', color: 'bg-blue-100 text-blue-700 border-blue-500' },
  'create:service': { label: 'Creación de Servicio', color: 'bg-emerald-100 text-emerald-700 border-emerald-500' },
  'update:settings': { label: 'Cambio de Configuración', color: 'bg-amber-100 text-amber-700 border-amber-500' },
  'update:fleet': { label: 'Gestión de Flota', color: 'bg-amber-100 text-amber-700 border-amber-500' },
  'delete:user': { label: 'Eliminación de Usuario', color: 'bg-rose-100 text-rose-700 border-rose-500' },
  'default': { label: 'Acción Desconocida', color: 'bg-slate-100 text-slate-700 border-slate-400' }
};

const getActionStyle = (action) => {
  // Búsqueda parcial para coincidir con tipos generales (ej: 'create', 'delete')
  if (action.includes('login')) return ACTION_CONFIG['login:success'];
  if (action.includes('create')) return ACTION_CONFIG['create:service'];
  if (action.includes('delete')) return ACTION_CONFIG['delete:user'];
  if (action.includes('update')) return ACTION_CONFIG['update:settings'];
  return ACTION_CONFIG['default'];
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

  // Función para obtener iniciales
  const getInitials = (email) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Obtener lista única de acciones para el select
  const uniqueActions = [...new Set(logs.map(l => l.action))];

  return (
    <div className="mx-auto max-w-[1600px] p-6 space-y-8 mb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Auditoría de Seguridad</h1>
          <p className="text-slate-500 mt-1">Registro detallado de accesos y acciones en la plataforma.</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Usuario</label>
            <div className="relative">
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="Buscar por correo..."
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Acción</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="todos">Todas las acciones</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>{getActionStyle(act).label || act}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Tabla Timeline */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Fecha / Hora</th>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Acción</th>
              <th className="px-6 py-4">Detalles</th>
              <th className="px-6 py-4">IP Origen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Cargando registros de auditoría...</td></tr>}

            {!loading && filteredList.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No se encontraron registros que coincidan con los filtros.</td></tr>
            )}

            {filteredList.map((log) => {
              const style = getActionStyle(log.action);
              const dateObj = new Date(log.timestamp);

              return (
                <tr key={log.id} className={`group hover:bg-slate-50/80 transition-colors border-l-4 ${style.color.split(' ').find(c => c.startsWith('border-'))}`}>
                  {/* Fecha y Hora */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{dateObj.toLocaleTimeString("es-CL", { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-xs text-slate-400">{dateObj.toLocaleDateString("es-CL")}</span>
                    </div>
                  </td>

                  {/* Usuario con Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 ring-2 ring-white shadow-sm">
                        {getInitials(log.user)}
                      </div>
                      <span className="font-medium text-slate-900">{log.user}</span>
                    </div>
                  </td>

                  {/* Badge de Acción */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${style.color.replace(/border-\w+/, '')}`}>
                      {style.label || log.action}
                    </span>
                  </td>

                  {/* Detalles Metadata */}
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500 font-medium leading-relaxed block max-w-md truncate" title={log.details}>
                      {log.details}
                    </span>
                  </td>

                  {/* IP Mono */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      {log.ip}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}