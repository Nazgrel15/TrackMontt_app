// src/lib/webhooks.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Dispara notificaciones a los webhooks registrados para un evento.
 * @param {string} eventName - Nombre del evento (ej: "service.created")
 * @param {object} payload - Datos a enviar (ej: objeto del servicio)
 * @param {string} empresaId - ID de la empresa (Tenant)
 */
export async function triggerWebhooks(eventName, payload, empresaId) {
  try {
    // 1. Buscar webhooks activos de esta empresa que escuchen este evento
    const webhooks = await prisma.webhook.findMany({
      where: {
        empresaId: empresaId,
        active: true,
        events: { has: eventName } // Filtro de array en Postgres
      }
    });

    if (webhooks.length === 0) return;

    console.log(`🔔 Disparando evento [${eventName}] a ${webhooks.length} webhooks...`);

    // 2. Enviar POST a cada URL (en paralelo, sin bloquear)
    // No usamos 'await' en el map para que la API principal responda rápido
    webhooks.forEach(wh => {
      fetch(wh.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-TrackMontt-Event": eventName,
          // "X-Signature": ... (Aquí iría la firma HMAC en prod)
        },
        body: JSON.stringify({
          event: eventName,
          timestamp: new Date().toISOString(),
          data: payload
        })
      }).catch(err => console.error(`❌ Error enviando webhook a ${wh.url}:`, err.message));
    });

  } catch (err) {
    console.error("Error en motor de webhooks:", err);
  }
}