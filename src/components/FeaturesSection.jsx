export default function FeaturesSection() {
  const features = [
    {
      icon: "🗺️",
      title: "Mapa en vivo",
      desc: "Flota, paradas y ETAs para anticipar atrasos y desvíos.",
    },
    {
      icon: "🧭",
      title: "Optimización",
      desc: "Sugerencias de rutas y tiempos con servicios de mapas.",
    },
    {
      icon: "✅",
      title: "Asistencia",
      desc: "Check-in/out en ruta y control de ocupación por servicio.",
    },
    {
      icon: "📈",
      title: "KPIs",
      desc: "Puntualidad, tiempo promedio, costo/km y cumplimiento SLA.",
    },
  ];

  return (
    <section id="caracteristicas" className="bg-white border-t">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-black">Características</h2>
          <p className="mt-2 text-black/70">
            Diseñado para la acuicultura: centros de cultivo, plantas y rutas de personal.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,.06)]"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                {f.icon}
              </div>
              <h3 className="font-semibold text-black">{f.title}</h3>
              <p className="mt-1 text-sm text-black/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
