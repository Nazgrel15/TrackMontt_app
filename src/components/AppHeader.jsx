// src/components/AppHeader.jsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAlerts } from "@/context/AlertContext";

export default function AppHeader({ role, userName }) {
  const pathname = usePathname();
  const { unreadCount } = useAlerts();

  // Inferir título de la página basado en la ruta
  const getPageTitle = (path) => {
    if (path.includes("/admin/drivers")) return "Gestión de Choferes";
    if (path.includes("/admin/fleet")) return "Gestión de Flota";
    if (path.includes("/admin/stops")) return "Gestión de Paradas";
    if (path.includes("/admin/trabajadores")) return "Gestión de Trabajadores";
    if (path.includes("/map")) return "Mapa en Vivo";
    if (path.includes("/planning")) return "Planificación de Rutas";
    if (path.includes("/reports")) return "Reportes y Estadísticas";
    if (path.includes("/auditoria")) return "Auditoría del Sistema";
    if (path.includes("/asistencia")) return "Control de Asistencia";
    return "Panel de Control";
  };

  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">

        {/* Izquierda: Título de la Página */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
        </div>

        {/* Derecha: Acciones y Perfil */}
        <div className="flex items-center gap-6">

          {/* Notificaciones */}
          {/* Notificaciones */}
          <Link href="/alerts" className="relative rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-colors">
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
            )}
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </Link>

          <div className="h-8 w-px bg-slate-200"></div>

          {/* Perfil de Usuario */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold text-slate-700 leading-none">{userName || "Usuario"}</span>
              <span className="text-xs font-medium text-slate-500 mt-1">{role === 'admin' ? 'Administrador' : role || 'Invitado'}</span>
            </div>

            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>

            <form action="/api/logout" method="post">
              <button
                className="group flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                title="Cerrar Sesión"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}