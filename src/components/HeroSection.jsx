// src/components/HeroSection.jsx
"use client";
import Image from "next/image";
import Link from "next/link";
import DashboardPreview from "./DashboardPreview";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 pt-16 pb-32 lg:pt-32 lg:pb-40">

      {/* Fondo con Patrón de Grid y Degradado */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">

        {/* Badge Superior */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1 text-sm font-medium text-blue-600 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Plataforma de Gestión de Transporte Corporativo
        </div>

        {/* Título Principal */}
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          Optimiza el transporte de tu personal con{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Inteligencia y Control
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="mx-auto max-w-2xl text-lg text-slate-600 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          TrackMontt centraliza la operación de flotas, control de asistencia y planificación de rutas para la industria acuícola. Toma decisiones basadas en datos en tiempo real.
        </p>

        {/* Botones CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 mb-12">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-slate-800 hover:scale-105 hover:shadow-indigo-500/50"
          >
            Ingresar a la Plataforma
          </Link>
          <Link
            href="#features"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-slate-600 transition-all hover:text-blue-600 hover:bg-blue-50"
          >
            Saber más
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Elemento Visual Abstracto (Glassmorphism) */}
        
          <div className="relative rounded-3xl border border-slate-200 bg-white/50 backdrop-blur-xl shadow-2xl overflow-hidden p-2 lg:p-4">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
            <div className="rounded-2xl shadow-sm border border-slate-100 bg-slate-50 overflow-hidden">
                <DashboardPreview />
            </div>
          </div>


        {/* Social Proof / Logos */}
        <div className="mt-20 border-t border-slate-200 pt-10">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Confían en nosotros</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholders de logos */}
            <div className="h-8 w-32 bg-slate-300 rounded animate-pulse"></div>
            <div className="h-8 w-32 bg-slate-300 rounded animate-pulse delay-100"></div>
            <div className="h-8 w-32 bg-slate-300 rounded animate-pulse delay-200"></div>
            <div className="h-8 w-32 bg-slate-300 rounded animate-pulse delay-300"></div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
