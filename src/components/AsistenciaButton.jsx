'use client';
import Link from 'next/link';

export default function AsistenciaButton({ serviceId }) {
  const href = serviceId
    ? `/asistencia?serviceId=${encodeURIComponent(serviceId)}`
    : '/asistencia';

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 hover:bg-slate-50 text-slate-900"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span>Ingresar asistencia</span>
    </Link>
  );
}
