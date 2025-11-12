// src/app/(protected)/salud/SaludClient.jsx
"use client";
import { mockSaludKPIs, mockErroresRecientes } from "@/lib/MockData";

// --- (Copiado de Dashboard) Componente de Tarjeta KPI ---
function KpiCard({ label, value, trend, hint, status }) {
  const trendColor = status === 'ok' ? 'bg-green-50 text-green-700' : 
                     status === 'warn' ? 'bg-yellow-50 text-yellow-700' : 
                     'bg-red-50 text-red-700';

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="text-sm text-black/60">{label}</div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-3xl font-semibold text-black">{value}</div>
        <span className={`text-xs rounded-full px-2 py-1 ${trendColor}`}>{trend}</span>
      </div>
      <div className="mt-2 text-xs text-black/50">{hint}</div>
    </div>
  );
}

export default function SaludClient() {
  
  // Helper para formatear fecha
  const formatTimestamp = (iso) => new Date(iso).toLocaleString("es-CL", { timeStyle: 'medium' });

  return (
    <div className="mx-auto grid max-w-6xl gap-6 text-black">
      <h1 className="text-xl font-semibold text-black">Estado del Sistema (Salud)</h1>

      {/* AC 1 y 2: KPIs (Uptime, Latencia) */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {mockSaludKPIs.map((k) => (
          <KpiCard key={k.id} {...k} />
        ))}
      </section>
      
      {/* AC 3: Errores recientes */}
      <section className="rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <h2 className="p-5 text-lg font-semibold text-black">Errores Recientes (Mock)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-black/70">
              <tr>
                <th className="px-5 py-3">Hora</th>
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3">Servicio/Ruta</th>
                <th className="px-5 py-3">Mensaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mockErroresRecientes.map((err) => (
                <tr key={err.id}>
                  <td className="px-5 py-3 whitespace-nowrap">{formatTimestamp(err.timestamp)}</td>
                  <td className="px-5 py-3">
                    <span className="font-mono font-semibold text-red-600">{err.code}</span>
                  </td>
                  <td className="px-5 py-3"><span className="font-mono">{err.service}</span></td>
                  <td className="px-5 py-3">{err.message}</td>
                </tr>
              ))}
              {mockErroresRecientes.length === 0 && (
                <tr><td colSpan="4" className="px-5 py-6 text-center text-black/60">No hay errores recientes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}