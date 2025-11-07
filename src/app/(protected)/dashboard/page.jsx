// Página: Dashboard (KPIs mock)
export const revalidate = 0;

const KPIS = [
  { id: "onTime",    label: "Puntualidad",           value: "92.3%", trend: "+1.2%",  hint: "Servicios que llegaron a tiempo" },
  { id: "avgTime",   label: "Tiempo promedio",       value: "38 min", trend: "-3 min", hint: "Duración media por traslado" },
  { id: "costPerKm", label: "Costo por km",          value: "$620 CLP", trend: "-$15", hint: "Costo operativo estimado" },
];

const ACTIVIDADES = [
  { id: 1, title: "Inicio de servicio Ruta A-12",   meta: "Chofer: P. Muñoz · 07:30",  status: "En curso" },
  { id: 2, title: "Arribo Planta Chincui",          meta: "Bus 03 · 07:58",            status: "Completado" },
  { id: 3, title: "Incidencia leve: tráfico denso", meta: "Ruta B-04 · 08:12",         status: "Demora" },
  { id: 4, title: "Salida Ruta C-02",               meta: "Chofer: L. Soto · 08:20",   status: "Programado" },
];

function KpiCard({ label, value, trend, hint }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="text-sm text-black/60">{label}</div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-3xl font-semibold text-black">{value}</div>
        <span className="text-xs rounded-full bg-green-50 text-green-700 px-2 py-1">{trend}</span>
      </div>
      <div className="mt-2 text-xs text-black/50">{hint}</div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      {/* KPIs */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {KPIS.map((k) => (
          <KpiCard key={k.id} {...k} />
        ))}
      </section>

      {/* Actividades recientes */}
      <section className="rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">Actividades recientes</h2>
          <a href="#" className="text-sm text-blue-700 hover:underline">Ver todo</a>
        </div>

        <ul className="mt-4 divide-y">
          {ACTIVIDADES.map((a) => (
            <li key={a.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-black">{a.title}</div>
                <div className="text-xs text-black/60">{a.meta}</div>
              </div>
              <span className={
                "text-xs rounded-full px-2 py-1 " +
                (a.status === "Completado"
                  ? "bg-emerald-50 text-emerald-700"
                  : a.status === "Demora"
                  ? "bg-amber-50 text-amber-700"
                  : a.status === "En curso"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-700")
              }>
                {a.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
