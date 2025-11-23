// src/app/(protected)/dashboard/page.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeServices: 0,
    totalBuses: 0,
    pendingAlerts: 0,
    busesInRoute: 0,
    busesAvailable: 0,
    busesMaintenance: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // 1. Cargar Servicios Activos y Recientes
        const resServices = await fetch("/api/services");
        const services = resServices.ok ? await resServices.json() : [];
        
        const active = services.filter(s => s.estado === "EnCurso").length;
        
        // Usamos los últimos 5 servicios como "Actividad Reciente"
        const recent = services.slice(0, 5).map(s => ({
          id: s.id,
          title: `${s.estado === 'EnCurso' ? 'En Ruta' : s.estado}: ${s.paradas[0]} -> ${s.paradas[s.paradas.length-1]}`,
          meta: `Bus: ${s.bus?.patente || '?'} • ${new Date(s.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
          status: s.estado,
          color: s.estado === 'EnCurso' ? 'bg-blue-500' : (s.estado === 'Finalizado' ? 'bg-emerald-500' : 'bg-slate-400')
        }));

        // 2. Cargar Flota
        const resBuses = await fetch("/api/buses");
        const buses = resBuses.ok ? await resBuses.json() : [];
        const totalBuses = buses.length;
        
        // Cálculo simple de ocupación (Asumimos que si hay X servicios activos, hay X buses ocupados)
        // En un sistema real, el bus tendría un estado propio, pero esto sirve para el MVP.
        const inRoute = active; 
        const available = Math.max(0, totalBuses - inRoute);

        // 3. Cargar Alertas
        const resAlerts = await fetch("/api/alerts");
        const alerts = resAlerts.ok ? await resAlerts.json() : [];
        const pendingAlerts = alerts.filter(a => a.estado === "Pendiente").length;

        setStats({
          activeServices: active,
          totalBuses: totalBuses,
          pendingAlerts: pendingAlerts,
          busesInRoute: inRoute,
          busesAvailable: available,
          busesMaintenance: 0 // Placeholder si no tienes campo de mantenimiento
        });
        setRecentActivity(recent);

      } catch (e) {
        console.error("Error cargando dashboard:", e);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // --- Renderizado de Widgets (Reutilizando tu diseño bonito) ---

  const occupancyPercent = stats.totalBuses > 0 ? Math.round((stats.busesInRoute / stats.totalBuses) * 100) : 0;
  const availablePercent = stats.totalBuses > 0 ? Math.round((stats.busesAvailable / stats.totalBuses) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-slate-500">Resumen operativo en tiempo real.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/planning" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700">
            Nueva Ruta
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10 text-slate-400">Cargando métricas...</p>
      ) : (
        /* Bento Grid */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 auto-rows-[minmax(180px,auto)]">
          
          {/* KPI 1: Servicios Activos */}
          <KpiCard 
            label="Servicios Activos" 
            value={stats.activeServices} 
            trend="En tiempo real"
            bg="bg-blue-100"
            text="text-blue-600"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
          />

          {/* KPI 2: Flota */}
          <KpiCard 
            label="Flota Total" 
            value={stats.totalBuses} 
            trend={`${stats.busesAvailable} disponibles`}
            bg="bg-indigo-100"
            text="text-indigo-600"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />}
          />

          {/* KPI 3: Alertas */}
          <KpiCard 
            label="Alertas Pendientes" 
            value={stats.pendingAlerts} 
            trend={stats.pendingAlerts > 0 ? "Requieren atención" : "Todo normal"}
            bg={stats.pendingAlerts > 0 ? "bg-red-100" : "bg-emerald-100"}
            text={stats.pendingAlerts > 0 ? "text-red-600" : "text-emerald-600"}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />}
          />

          {/* Feed de Actividad */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 hover:shadow-2xl md:col-span-1 md:row-span-2">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Últimos Servicios</h3>
            <div className="space-y-6">
              {recentActivity.length === 0 && <p className="text-sm text-slate-400">No hay actividad reciente.</p>}
              {recentActivity.map((a, i) => (
                <div key={a.id} className="relative flex gap-4">
                  {i !== recentActivity.length - 1 && <div className="absolute left-[11px] top-8 h-full w-0.5 bg-slate-100"></div>}
                  <div className={`relative z-10 mt-1 h-6 w-6 flex-shrink-0 rounded-full border-2 border-white shadow-sm ${a.color}`}></div>
                  <div className="flex-1 pb-1">
                    <h4 className="text-sm font-bold text-slate-900">{a.title}</h4>
                    <p className="mt-0.5 text-xs text-slate-500">{a.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget Ocupación */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl md:col-span-2">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Ocupación de Flota</h3>
            
            <div className="flex h-12 w-full overflow-hidden rounded-xl bg-slate-100">
              {occupancyPercent > 0 && (
                <div className="flex items-center justify-center bg-blue-500 text-xs font-bold text-white transition-all" style={{ width: `${occupancyPercent}%` }}>
                  {occupancyPercent}%
                </div>
              )}
              {availablePercent > 0 && (
                <div className="flex items-center justify-center bg-emerald-500 text-xs font-bold text-white transition-all" style={{ width: `${availablePercent}%` }}>
                  {availablePercent}%
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500"></span> En Ruta</div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500"></span> Disponible</div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// Sub-componente simple para las tarjetas
function KpiCard({ label, value, trend, icon, bg, text }) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className="mt-2 text-4xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`rounded-2xl p-4 ${bg} transition-transform duration-300 group-hover:rotate-6`}>
          <svg className={`w-8 h-8 ${text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icon}
          </svg>
        </div>
      </div>
      <div className="mt-4">
        <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {trend}
        </span>
      </div>
    </div>
  );
}