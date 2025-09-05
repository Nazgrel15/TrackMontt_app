"use client"
export default function ContactSection() {
  return (
    <section id="contacto" className="border-t bg-[#0B1220]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Solicita una demo</h2>
            <p className="mt-2 text-white/70">
              Coordina una sesión para ver TrackMontt en acción con datos de ejemplo.
            </p>
            <ul className="mt-4 list-disc pl-5 text-sm text-white/70">
              <li>Monitoreo en tiempo real con WebSocket.</li>
              <li>Planificación y asistencia a bordo.</li>
              <li>Reportes operativos listos para RR.HH.</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="mb-1 block text-sm font-medium text-white">Nombre</label>
                <input
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white">Correo</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="tucorreo@empresa.cl"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white">Mensaje</label>
                <textarea
                  className="h-24 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Cuéntanos sobre tus rutas y turnos…"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-3 font-medium text-white hover:opacity-95"
              >
                Enviar
              </button>
            </form>
            <p className="mt-3 text-center text-xs text-white/50">
              *Formulario ilustrativo. Integraremos backend/Email más adelante.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
