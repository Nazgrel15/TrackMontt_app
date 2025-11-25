// src/app/(protected)/alerts/AlertsClient.jsx
"use client";
import { useState, useMemo } from "react";
import { useAlerts } from "@/context/AlertContext";

// --- Estilos ---
const severityConfig = {
  rojo: {
    border: "border-red-500",
    bgIcon: "bg-red-100",
    textIcon: "text-red-600",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  },
  Alta: {
    border: "border-red-500",
    bgIcon: "bg-red-100",
    textIcon: "text-red-600",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  },
  amarillo: {
    border: "border-yellow-500",
    bgIcon: "bg-yellow-100",
    textIcon: "text-yellow-600",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  Media: {
    border: "border-yellow-500",
    bgIcon: "bg-yellow-100",
    textIcon: "text-yellow-600",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  verde: {
    border: "border-emerald-500",
    bgIcon: "bg-emerald-100",
    textIcon: "text-emerald-600",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  Baja: {
    border: "border-emerald-500",
    bgIcon: "bg-emerald-100",
    textIcon: "text-emerald-600",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
};

/* ======== Componente Modal de Detalle ======== */
function AlertDetailModal({ alert, onClose }) {
  if (!alert) return null;

  const { servicio } = alert;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200">

        {/* Header del Modal */}
        <div className="flex items-start justify-between p-8 pb-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${severityConfig[alert.severidad].bgIcon} ${severityConfig[alert.severidad].textIcon}`}>
              {severityConfig[alert.severidad].icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Detalle de Alerta</h3>
              <p className="text-sm text-slate-500 font-medium">ID: #{alert.id.toString().padStart(6, '0')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Cuerpo del Modal - Scrollable */}
        <div className="px-8 pb-6 overflow-y-auto flex-1 space-y-6">

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mensaje del Sistema</p>
            <p className="text-slate-800 font-medium text-lg leading-relaxed">{alert.mensaje}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estado Actual</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {alert.estado}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hora Detección</p>
              <p className="font-mono text-slate-700 font-medium">{new Date(alert.timestamp).toLocaleString("es-CL")}</p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Información del Servicio Relacionado (si existe) */}
          {servicio ? (
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                <span className="text-xl">🚍</span> Información del Servicio
              </h4>
              <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Ruta</span>
                  <span className="text-sm font-medium text-slate-700">{servicio.paradas[0]} → {servicio.paradas[servicio.paradas.length - 1]}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Turno</span>
                  <span className="text-sm font-medium text-slate-700">{servicio.turno}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Bus</span>
                  <span className="text-sm font-medium text-slate-700">{servicio.bus?.patente || "S/N"}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Conductor</span>
                  <span className="text-sm font-medium text-slate-700">{servicio.chofer?.nombre || "S/N"}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 italic text-center py-4">Sin información de servicio asociada.</p>
          )}

          {/* Mostrar foto del incidente si existe */}
          {alert.tipo?.startsWith('Incidente:') && alert.incidente?.urlFoto && (
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                <span className="text-xl">📸</span> Foto del Incidente
              </h4>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden p-4">
                <img
                  src={alert.incidente.urlFoto}
                  alt="Foto del incidente"
                  className="w-full h-auto max-h-[400px] object-contain rounded-xl bg-white shadow-sm"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer / Acciones */}
        <div className="p-8 pt-6 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
          <button
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all"
            onClick={() => window.alert("Funcionalidad de gestión (Ticket futuro)")}
          >
            Marcar como Resuelto
          </button>
        </div>

      </div>
    </div>
  );
}

/* ======== Componente Principal ======== */
export default function AlertsClient() {
  const { alerts, loading, refreshAlerts } = useAlerts();
  const [filterType, setFilterType] = useState("todos");
  const [checking, setChecking] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Removed local loadAlerts and useEffect since context handles it

  const handleRunCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/alerts/check", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.generadas > 0) {
        alert(`⚠️ Se detectaron ${data.generadas} nuevas alertas.`);
        refreshAlerts();
      } else {
        alert("Sistema normal. No se detectaron nuevas anomalías.");
      }
    } catch (e) {
      alert("Error al conectar con el motor de alertas.");
    } finally {
      setChecking(false);
    }
  };

  const filteredAlerts = useMemo(() => {
    if (filterType === "todos") return alerts;
    if (filterType === "Incidente") {
      return alerts.filter((a) => a.tipo?.startsWith('Incidente:'));
    }
    return alerts.filter((a) => a.tipo === filterType);
  }, [alerts, filterType]);

  const filters = [
    { id: "todos", label: "Todos" },
    { id: "retraso", label: "Retrasos" },
    { id: "desvio", label: "Desvíos" },
    { id: "parada_omitida", label: "Paradas Omitidas" },
    { id: "Incidente", label: "Incidentes" },
  ];

  return (
    <div className="mx-auto max-w-5xl pb-24">

      {/* Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Feed de Actividad</h1>
          <p className="text-slate-500 mt-2 text-lg">Monitoreo de anomalías y alertas en tiempo real.</p>
        </div>
        <button
          onClick={handleRunCheck}
          disabled={checking}
          className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
        >
          <span className={checking ? "animate-spin" : ""}>🔄</span>
          {checking ? "Analizando..." : "Ejecutar Diagnóstico"}
        </button>
      </div>

      {/* Filtros (Pills) */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${filterType === f.id
              ? "bg-slate-800 text-white shadow-lg shadow-slate-800/20"
              : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed de Alertas */}
      <div className="flex flex-col gap-4">
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium">Cargando actividad...</p>
          </div>
        )}

        {!loading && filteredAlerts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-lg font-bold text-slate-900">Todo en orden</h3>
            <p className="text-slate-500">No hay alertas que coincidan con los filtros.</p>
          </div>
        )}

        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => setSelectedAlert(alert)}
            className={`group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border-l-[6px] cursor-pointer ${severityConfig[alert.severidad].border}`}
          >
            <div className="flex items-start gap-5">
              {/* Icono */}
              <div className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center ${severityConfig[alert.severidad].bgIcon} ${severityConfig[alert.severidad].textIcon}`}>
                {severityConfig[alert.severidad].icon}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-bold text-slate-800 capitalize">
                    {alert.tipo.replace('_', ' ')}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                    {alert.estado}
                  </span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed truncate pr-8">
                  {alert.mensaje}
                </p>
              </div>

              {/* Hora */}
              <div className="absolute top-6 right-6 font-mono text-xs font-medium text-slate-400">
                {new Date(alert.timestamp).toLocaleTimeString("es-CL", { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Acción Hover */}
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="flex items-center gap-1 text-sm font-bold text-blue-600">
                Ver Detalle
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}