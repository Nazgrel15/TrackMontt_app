"use client";
import { useState } from "react";

// Datos mock iniciales
const MOCK_NOTIFICACIONES = Object.freeze([
  { id: 1, text: "Incidencia: Tráfico denso en Ruta B-04. Posible retraso de 10 min.", timestamp: "2025-09-06T08:12:00Z", read: false },
  { id: 2, text: "Chofer P. Muñoz ha iniciado el servicio Ruta A-12.", timestamp: "2025-09-06T07:31:00Z", read: false },
  { id: 3, text: "Servicio C-02 (Planta Chincui) ha finalizado.", timestamp: "2025-09-05T18:05:00Z", read: true },
  { id: 4, text: "Mantenimiento programado para el Bus B-01 esta noche.", timestamp: "2025-09-05T16:30:00Z", read: true },
]);

// Helper para formatear la fecha
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("es-CL", { 
    day: 'numeric', 
    month: 'long', 
    hour: 'numeric', 
    minute: '2-digit' 
  });
}

export default function NotificacionesClient() {
  const [notifications, setNotifications] = useState(() => [...MOCK_NOTIFICACIONES]);

  // Criterio 3: "Marcar todo como leído"
  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  // (Extra) Marcar una sola como leída al hacer clic
  const handleMarkOneAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Contar cuántas no están leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="mx-auto grid max-w-4xl gap-6 text-black">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-black">
          Notificaciones
          {unreadCount > 0 && (
            <span className="ml-2 inline-block rounded-full bg-blue-600 px-2.5 py-0.5 text-sm font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </h1>
        <button
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="rounded-lg border px-3 py-1.5 text-sm text-black
                     hover:bg-black/5
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          Marcar todo como leído
        </button>
      </div>

      {/* Criterio 1: Listado de notificaciones */}
      <section className="rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <ul className="divide-y divide-gray-200">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              onClick={() => handleMarkOneAsRead(notif.id)}
              className={`flex items-start gap-4 p-4 ${!notif.read ? 'cursor-pointer hover:bg-slate-50' : ''}`}
            >
              {/* Criterio 2: Estado leída/no leída */}
              <div className="flex-shrink-0 pt-1.5">
                {!notif.read ? (
                  <span className="block h-2.5 w-2.5 rounded-full bg-blue-600" title="No leído"></span>
                ) : (
                  <span className="block h-2.5 w-2.5 rounded-full bg-transparent" title="Leído"></span>
                )}
              </div>
              
              <div className="flex-grow">
                <p className={`text-sm ${!notif.read ? 'font-semibold text-black' : 'text-black/80'}`}>
                  {notif.text}
                </p>
                <p className="mt-0.5 text-xs text-black/60">
                  {formatTimestamp(notif.timestamp)}
                </p>
              </div>
            </li>
          ))}

          {notifications.length === 0 && (
             <li className="p-6 text-center text-sm text-black/60">
               No tienes notificaciones.
             </li>
          )}
        </ul>
      </section>
    </div>
  );
}