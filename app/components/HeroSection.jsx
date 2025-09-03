"use client";
import Image from "next/image";
import dynamic from "next/dynamic";

// Evita problemas de SSR con la lib
const TypeAnimation = dynamic(
  () => import("react-type-animation").then((m) => m.TypeAnimation),
  { ssr: false }
);

const HeroSection = () => {
  // El más largo de la lista para reservar ancho/alto del texto animado
  const LONGEST = "Optimización de rutas";

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Fondo sutil con formas azules */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-100 blur-3xl opacity-60" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-50 blur-3xl opacity-70" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Columna de texto */}
        <div className="col-span-7 order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black">
            SaaS multi-tenant • Tiempo real • Acuicultura
          </span>

          <h1 className="mt-4 mb-4 text-4xl font-extrabold leading-tight text-black sm:text-5xl lg:text-6xl">
            <span className="block text-black">TrackMontt</span>
            <span className="block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
                Monitoreo y optimización
              </span>{" "}
              de traslados
            </span>
          </h1>

          {/* Texto animado: claims de valor */}
          <div className="relative inline-block w-[22ch] align-top">
            <span className="invisible">{LONGEST}</span>
            <span className="absolute inset-0 bg-clip-text text-lg font-semibold text-blue-700">
              <TypeAnimation
                sequence={[
                  "Monitoreo en tiempo real", 1200,
                  "Optimización de rutas", 1200,
                  "Control de asistencia", 1200,
                  "KPIs y SLA operativos", 1200,
                ]}
                wrapper="span"
                speed={70}
                repeat={Infinity}
              />
            </span>
          </div>

          <p className="mt-4 text-base text-black/70 sm:text-lg lg:text-xl">
            Plataforma web para empresas salmoneras: planifica servicios, visualiza la
            flota en vivo, controla asistencia y mide desempeño entre{" "}
            <strong>centros de cultivo</strong> y <strong>plantas de proceso</strong>.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-3 text-white shadow-sm transition hover:opacity-95"
            >
              Solicitar demo
            </a>
            <a
              href="#caracteristicas"
              className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-6 py-3 text-black hover:bg-black/5"
            >
              Ver características
            </a>
          </div>

          {/* Badges de confianza */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-black/60">
            <span className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1">WebSocket en vivo</span>
            <span className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1">Reportes y KPIs</span>
            <span className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1">Privacidad y RLS por empresa</span>
          </div>
        </div>

        {/* Columna visual */}
        <div className="col-span-5 order-1 lg:order-2">
          <div className="relative mx-auto h-[260px] w-[260px] rounded-3xl bg-white shadow-[0_8px_24px_rgba(0,0,0,.08)] ring-1 ring-black/5 sm:h-[320px] sm:w-[320px] lg:h-[400px] lg:w-[400px]">
            {/* “Anillo” decorativo azul */}
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-blue-200 to-blue-100 blur-2xl" />
            <Image
              src="/images/hero-aqua-fleet.png" // reemplaza por tu imagen (flota/acuicultura)
              alt="Monitoreo de flota en tiempo real para acuicultura"
              className="absolute left-1/2 top-1/2 h-auto w-[78%] -translate-x-1/2 -translate-y-1/2 select-none"
              width={600}
              height={600}
              priority
            />
          </div>
          <p className="mt-3 text-center text-xs text-black/50">
            Visualiza buses, paradas y ETAs entre centros de cultivo y plantas.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
