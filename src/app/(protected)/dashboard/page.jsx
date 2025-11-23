// src/app/(protected)/dashboard/page.jsx
export const revalidate = 0;

const KPIS = [
  {
    id: "activeServices",
    label: "Servicios Activos",
    value: "12",
    trend: "+2 vs ayer",
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    bg: "bg-blue-100",
    text: "text-blue-600",
  },
  {
    id: "fleet",
    label: "Flota Total",
    value: "24",
    trend: "100% operativa",
    icon: (
      <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    bg: "bg-indigo-100",
    text: "text-indigo-600",
  },
  {
    id: "alerts",
    label: "Alertas",
    value: "3",
    trend: "Requieren atención",
    icon: (
      <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    bg: "bg-amber-100",
    text: "text-amber-600",
  },
];

const ACTIVIDADES = [
  { id: 1, title: "Inicio de servicio Ruta A-12", meta: "Chofer: P. Muñoz · 07:30", status: "En curso", color: "bg-blue-500" },
  { id: 2, title: "Arribo Planta Chincui", meta: "Bus 03 · 07:58", status: "Completado", color: "bg-emerald-500" },
  { id: 3, title: "Incidencia leve: tráfico denso", meta: "Ruta B-04 · 08:12", status: "Demora", color: "bg-amber-500" },
  { id: 4, title: "Salida Ruta C-02", meta: "Chofer: L. Soto · 08:20", status: "Programado", color: "bg-slate-400" },
  { id: 5, title: "Mantenimiento programado", meta: "Bus 05 · 09:00", status: "Taller", color: "bg-purple-500" },
];

function KpiCard({ label, value, trend, icon, bg }) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className="mt-2 text-4xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`rounded-2xl p-4 ${bg} transition-transform duration-300 group-hover:rotate-6`}>
          {icon}
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

function OccupancyWidget() {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl md:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Ocupación de Flota</h3>
          <p className="text-sm text-slate-500">Estado actual de los vehículos</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="flex h-12 w-full overflow-hidden rounded-xl bg-slate-100">
        <div className="flex h-full w-[50%] items-center justify-center bg-blue-500 text-xs font-bold text-white transition-all hover:bg-blue-600" title="En Ruta: 50%">
          50%
        </div>
        <div className="flex h-full w-[30%] items-center justify-center bg-emerald-500 text-xs font-bold text-white transition-all hover:bg-emerald-600" title="Disponible: 30%">
          30%
        </div>
        <div className="flex h-full w-[20%] items-center justify-center bg-slate-300 text-xs font-bold text-slate-600 transition-all hover:bg-slate-400" title="Mantenimiento: 20%">
          20%
        </div>
      </div>

      <div className="mt-4 flex gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-500"></span> En Ruta
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500"></span> Disponible
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-slate-300"></span> Mantenimiento
        </div>
      </div>
    </div>
  );
}

function ActivityFeed() {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 hover:shadow-2xl md:col-span-1 md:row-span-2">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Actividad Reciente</h3>
        <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        {ACTIVIDADES.map((a, i) => (
          <div key={a.id} className="relative flex gap-4">
            {/* Timeline line */}
            {i !== ACTIVIDADES.length - 1 && (
              <div className="absolute left-[11px] top-8 h-full w-0.5 bg-slate-100"></div>
            )}

            <div className={`relative z-10 mt-1 h-6 w-6 flex-shrink-0 rounded-full border-2 border-white shadow-sm ${a.color}`}></div>

            <div className="flex-1 pb-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">{a.title}</h4>
                <span className="text-[10px] font-medium text-slate-400">{a.status}</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{a.meta}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-slate-50 pt-4 text-center">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Ver historial completo</button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-slate-500">Bienvenido de vuelta, aquí está el resumen de hoy.</p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50">
            Descargar Reporte
          </button>
          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700">
            Nueva Ruta
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 auto-rows-[minmax(180px,auto)]">
        {/* KPIs */}
        {KPIS.map((k) => (
          <KpiCard key={k.id} {...k} />
        ))}

        {/* Activity Feed (Tall item) */}
        <ActivityFeed />

        {/* Occupancy Widget (Wide item) */}
        <OccupancyWidget />

        {/* Placeholder for future widget */}
        <div className="group relative flex flex-col justify-center items-center overflow-hidden rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 p-6 transition-all hover:border-slate-300 hover:bg-slate-100 md:col-span-2">
          <div className="rounded-full bg-white p-3 shadow-sm mb-3">
            <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-500">Añadir Widget</p>
        </div>
      </div>
    </div>
  );
}
