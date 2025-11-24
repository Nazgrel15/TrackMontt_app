// src/app/(protected)/salud/SaludClient.jsx
"use client";
import { useState, useEffect } from "react";

// Icon Components
function DatabaseIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
}

function SatelliteIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function WebhookIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ServiceCard({ service }) {
  const isOnline = service.status === 'online';
  const statusColor = isOnline
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-red-50 text-red-700 border-red-200';

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'database': return <DatabaseIcon />;
      case 'cloud': return <CloudIcon />;
      case 'satellite': return <SatelliteIcon />;
      case 'webhook': return <WebhookIcon />;
      default: return <CloudIcon />;
    }
  };

  return (
    <div className="group relative rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 transition-all hover:shadow-2xl hover:scale-[1.02]">
      {/* Header with Icon and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${isOnline ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-rose-600'} shadow-lg`}>
          <div className="text-white">
            {getIcon(service.icon)}
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusColor}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Service Name */}
      <h3 className="text-lg font-bold text-slate-800 mb-1">{service.name}</h3>
      <p className="text-xs text-slate-500 mb-4">{service.description}</p>

      {/* Metrics */}
      <div className="space-y-3">
        {/* Uptime Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-600">Uptime</span>
            <span className="text-xs font-bold text-emerald-600">{service.uptime}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm"
              style={{ width: `${service.uptime}%` }}
            />
          </div>
        </div>

        {/* Latency */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-600">Latencia</span>
          <span className="text-sm font-mono font-bold text-slate-800">{service.latency}ms</span>
        </div>
      </div>
    </div>
  );
}

export default function SaludClient() {
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [services, setServices] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [recentErrors, setRecentErrors] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealthData = async () => {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Failed to fetch health data');
      const data = await res.json();

      setServices(data.services);
      setKpis(data.kpis);
      setRecentErrors(data.recentErrors || []);
      setLastUpdated(new Date(data.timestamp));
    } catch (error) {
      console.error("Error fetching health data:", error);
      // Fallback or error state could be handled here
    } finally {
      setIsLoading(false);
      setIsRunningDiagnostic(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  // Determine overall system status
  const allServicesOnline = services.every(s => s.status === 'online');
  // Consideramos saludable si los KPIs están 'ok' o 'warn' (solo 'error' es crítico)
  const allKPIsOk = kpis.every(k => k.status === 'ok' || k.status === 'warn');
  const systemHealthy = allServicesOnline && allKPIsOk;

  // Run diagnostic simulation (now real fetch)
  const handleRunDiagnostic = () => {
    setIsRunningDiagnostic(true);
    // Add a small delay to show the animation even if the API is fast
    setTimeout(() => {
      fetchHealthData();
    }, 800);
  };

  // Format timestamp
  const formatTimestamp = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("es-CL", {
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
  };

  const lastUpdateText = lastUpdated ? lastUpdated.toLocaleString("es-CL", {
    dateStyle: 'long',
    timeStyle: 'medium'
  }) : "Cargando...";

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-500 font-medium">Cargando diagnóstico del sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Global Status Indicator - Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-900/5">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Traffic Light Indicator */}
              <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-full shadow-2xl ${systemHealthy
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/50'
                : 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/50'
                }`}>
                {systemHealthy ? (
                  <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>

              {/* Status Text */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                  {systemHealthy ? 'Todos los sistemas operativos' : 'Sistemas con problemas detectados'}
                </h1>
                <p className="text-slate-600 text-lg">
                  Panel de Estado de Ingeniería
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Última actualización: {lastUpdateText}
                </p>
              </div>

              {/* Diagnostic Button */}
              <button
                onClick={handleRunDiagnostic}
                disabled={isRunningDiagnostic}
                className="shrink-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRunningDiagnostic ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ejecutando...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Ejecutar Diagnóstico Ahora
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 -z-0 h-full w-1/3 opacity-5">
            <div className="h-full w-full bg-gradient-to-l from-blue-600 to-transparent"></div>
          </div>
        </section>

        {/* Service Grid */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Servicios Críticos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        {/* System KPIs */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Métricas del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kpis.map((kpi) => {
              const statusColors = {
                ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                warn: 'bg-amber-50 text-amber-700 border-amber-200',
                error: 'bg-red-50 text-red-700 border-red-200'
              };

              return (
                <div key={kpi.id} className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5">
                  <div className="text-sm font-medium text-slate-600 mb-1">{kpi.label}</div>
                  <div className="flex items-end justify-between mt-3 mb-2">
                    <div className="text-4xl font-bold text-slate-900">{kpi.value}</div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusColors[kpi.status]}`}>
                      {kpi.trend}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">{kpi.hint}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Errors Section */}
        <section className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-xl font-bold text-slate-800">Errores Recientes</h2>
            <p className="text-sm text-slate-600 mt-1">Registro de eventos y errores del sistema</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Hora</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Código</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Servicio/Ruta</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Mensaje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentErrors.map((err) => {
                  const is5xx = err.code >= 500;
                  const is4xx = err.code >= 400 && err.code < 500;
                  const codeColor = is5xx ? 'text-red-600 bg-red-50' : is4xx ? 'text-amber-600 bg-amber-50' : 'text-slate-600 bg-slate-50';

                  return (
                    <tr key={err.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {formatTimestamp(err.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 font-mono text-xs font-bold ${codeColor}`}>
                          {err.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-700">{err.service}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{err.message}</td>
                    </tr>
                  );
                })}
                {recentErrors.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-slate-600 font-medium">No hay errores recientes</p>
                        <p className="text-sm text-slate-500">El sistema está funcionando correctamente</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}