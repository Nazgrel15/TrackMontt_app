"use client";
import { useState, useEffect, useMemo } from "react";

// --- Estilos ---
const severityClasses = {
  rojo: "bg-red-100 text-red-800 border-red-300",
  amarillo: "bg-yellow-100 text-yellow-800 border-yellow-300",
  verde: "bg-green-100 text-green-800 border-green-300",
};

const statusClasses = {
  Pendiente: "bg-gray-200 text-gray-800",
  "En proceso": "bg-blue-200 text-blue-800",
  Cerrada: "bg-green-200 text-green-800",
};

/* ======== Componente Modal de Detalle ======== */
function AlertDetailModal({ alert, onClose }) {
  if (!alert) return null;

  const { servicio } = alert;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
        
        {/* Header del Modal */}
        <div className="flex items-start justify-between border-b pb-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Detalle de Alerta</h3>
            <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-bold rounded-full ${severityClasses[alert.severidad].split(' ')[0]} ${severityClasses[alert.severidad].split(' ')[1]}`}>
              {alert.severidad.toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="space-y-4 text-sm">
          
          <div className="bg-slate-50 p-3 rounded-lg border">
            <p className="text-gray-500 text-xs uppercase font-semibold">Mensaje</p>
            <p className="text-gray-900 font-medium mt-1">{alert.mensaje}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs">Estado</p>
              <p className="font-semibold">{alert.estado}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Hora Detección</p>
              <p className="font-mono">{new Date(alert.timestamp).toLocaleString("es-CL")}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Tipo</p>
              <p className="capitalize">{alert.tipo.replace('_', ' ')}</p>
            </div>
          </div>

          <hr className="border-gray-100"/>

          {/* Información del Servicio Relacionado (si existe) */}
          {servicio ? (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                🚍 Información del Servicio
              </h4>
              <div className="grid grid-cols-2 gap-y-2 text-gray-700">
                <div><span className="text-gray-400 text-xs block">Ruta:</span> {servicio.paradas[0]} → {servicio.paradas[servicio.paradas.length-1]}</div>
                <div><span className="text-gray-400 text-xs block">Turno:</span> {servicio.turno}</div>
                <div><span className="text-gray-400 text-xs block">Bus:</span> {servicio.bus?.patente || "S/N"}</div>
                <div><span className="text-gray-400 text-xs block">Chofer:</span> {servicio.chofer?.nombre || "S/N"}</div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 italic">Sin información de servicio asociada.</p>
          )}

        </div>

        {/* Footer / Acciones */}
        <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50 text-gray-700"
          >
            Cerrar
          </button>
          <button 
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
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
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("todos");
  const [checking, setChecking] = useState(false);
  
  // ✨ Nuevo estado para el modal
  const [selectedAlert, setSelectedAlert] = useState(null);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alerts");
      if (res.ok) setAlerts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAlerts(); }, []);

  const handleRunCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/alerts/check", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.generadas > 0) {
        alert(`⚠️ Se detectaron ${data.generadas} nuevas alertas.`);
        loadAlerts(); 
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
    return alerts.filter((a) => a.tipo === filterType);
  }, [alerts, filterType]);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 text-black">
      
      {/* Modal (se muestra si hay selectedAlert) */}
      {selectedAlert && (
        <AlertDetailModal 
          alert={selectedAlert} 
          onClose={() => setSelectedAlert(null)} 
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-black">Monitor de Alertas</h1>
        <button
          onClick={handleRunCheck}
          disabled={checking}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {checking ? "Analizando flota..." : "🔄 Ejecutar Diagnóstico"}
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <label className="block text-sm font-medium text-black mb-1">Filtrar por tipo:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 outline-none"
        >
          <option value="todos">Todos</option>
          <option value="retraso">Retraso</option>
          <option value="desvio">Desvío</option>
          <option value="parada_omitida">Parada Omitida</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Severidad</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Mensaje</th>
              <th className="px-4 py-3">Hora</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Cargando alertas...</td></tr>}
            
            {!loading && filteredAlerts.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hay alertas registradas.</td></tr>
            )}

            {filteredAlerts.map((alert) => (
              <tr 
                key={alert.id} 
                className="hover:bg-slate-50/80 transition cursor-pointer"
                onClick={() => setSelectedAlert(alert)} // ✨ Clic en fila abre modal
              >
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusClasses[alert.estado]}`}>
                    {alert.estado}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`block h-2.5 w-2.5 rounded-full ${severityClasses[alert.severidad].split(' ')[0].replace('bg-', 'bg-').replace('100', '500')}`}></span>
                    <span className="capitalize">{alert.severidad}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium capitalize">{alert.tipo.replace('_', ' ')}</td>
                <td className="px-4 py-3 max-w-xs truncate text-gray-600" title={alert.mensaje}>{alert.mensaje}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(alert.timestamp).toLocaleTimeString("es-CL", { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar doble evento
                      setSelectedAlert(alert);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-100 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}