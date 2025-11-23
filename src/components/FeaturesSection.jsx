// src/components/FeaturesSection.jsx
export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      title: "Control Total en Mapa",
      desc: "Visualiza tu flota en tiempo real, gestiona paradas y anticipa retrasos con precisión GPS.",
      color: "bg-blue-500"
    },
    {
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: "Rutas Inteligentes",
      desc: "Optimiza recorridos automáticamente para reducir tiempos de traslado y consumo de combustible.",
      color: "bg-indigo-500"
    },
    {
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Asistencia Digital",
      desc: "Registro automático de pasajeros con tecnología QR y reportes de ocupación por servicio.",
      color: "bg-purple-500"
    },
    {
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
      ),
      title: "Reportes y KPIs",
      desc: "Dashboards ejecutivos con métricas de puntualidad, costos por kilómetro y cumplimiento de SLA.",
      color: "bg-emerald-500"
    },
  ];

  return (
    <section id="features" className="bg-slate-50 py-24 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-semibold text-blue-600 uppercase tracking-wide">Características Principales</h2>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Todo lo que necesitas para gestionar tu transporte
          </p>
          <p className="mt-4 text-lg text-slate-600">
            Diseñado específicamente para la complejidad logística de la industria acuícola y el transporte de personal.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, index) => (
            <div
              key={f.title}
              className="group relative rounded-3xl bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1"
            >
              <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${f.color} shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
