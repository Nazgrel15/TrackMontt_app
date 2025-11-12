// src/components/Sidebar.jsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navByRole = {
  Administrador: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/planning", label: "Planificación" },
    { href: "/map", label: "Mapa" },
    { href: "/asistencia", label: "Asistencia" },
    { href: "/alerts", label: "Alertas" },
    { href: "/reports", label: "Reportes" },
    { href: "/admin", label: "Administración" },
    { href: "/admin/fleet", label: "Flota" },
    { href: "/admin/drivers", label: "Choferes" },
    { href: "/admin/stops", label: "Paradas" },
    { href: "/admin/parametros", label: "Parámetros" },
    { href: "/admin/trabajadores", label: "Trabajadores" },
    { href: "/perfil", label: "Mi Perfil" },
  ],
  Supervisor: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/planning", label: "Planificación" },
    { href: "/alerts", label: "Alertas" },
    { href: "/map", label: "Mapa" },
    { href: "/reports", label: "Reportes" },
    { href: "/admin/trabajadores", label: "Trabajadores" },
    { href: "/perfil", label: "Mi Perfil" },
  ],
  Chofer: [
    { href: "/driver", label: "Mi servicio" },
    { href: "/perfil", label: "Mi Perfil" },
  ],
};

export default function Sidebar({ role }) {
  const pathname = usePathname();

  // 👇 clave: no renderizar nada hasta que el cliente esté montado
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const items = navByRole[role] ?? navByRole.Supervisor;

  return (
    <nav className="space-y-1">
      {items.map((i) => {
        const active = pathname === i.href || pathname.startsWith(i.href + "/");
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 transition
              ${active ? "bg-blue-50 font-semibold text-blue-700" : "text-black hover:bg-black/5"}`}
          >
            <span>{i.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
