// src/components/ContactSection.jsx
"use client"
export default function ContactSection() {
  return (
    <section id="contacto" className="relative bg-slate-900 py-24 overflow-hidden">
      {/* Fondo Decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Columna de Información */}
          <div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl mb-6">
              ¿Listo para optimizar tu operación?
            </h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Agenda una demostración personalizada y descubre cómo TrackMontt puede reducir costos y mejorar la puntualidad de tu transporte corporativo.
            </p>

            <ul className="space-y-6">
              {[
                "Geolocalización precisa en tiempo real con alertas.",
                "Cálculo de rutas óptimas y cumplimiento de horarios.",
                "PWA para conductores con funcionamiento sin internet.",
                "Reportes de asistencia y KPIs exportables para RR.HH."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
                    <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tarjeta del Formulario */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Solicita una Demo</h3>
            <p className="text-slate-500 mb-8 text-sm">Completa tus datos y te contactaremos a la brevedad.</p>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nombre</label>
                  <input
                    className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Empresa</label>
                  <input
                    className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Empresa S.A."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Correo Corporativo</label>
                <input
                  type="email"
                  className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="juan@empresa.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mensaje</label>
                <textarea
                  className="h-32 w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  placeholder="Cuéntanos sobre tus necesidades de transporte..."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-200"
              >
                Enviar Solicitud
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                Al enviar aceptas nuestra política de privacidad.
              </p>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
