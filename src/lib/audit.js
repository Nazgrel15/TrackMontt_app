// src/lib/audit.js
import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";

const prisma = new PrismaClient();

/**
 * Registra un evento de auditoría en la base de datos.
 * @param {Object} session - Objeto de sesión (req. userId, empresaId).
 * @param {string} accion - Código de la acción (ej: "login:success", "update:settings").
 * @param {string} detalles - Descripción legible del cambio.
 */
export async function logAudit({ session, accion, detalles }) {
  if (!session || !session.empresaId || !session.userId) {
    console.warn("Intento de auditoría sin sesión válida:", accion);
    return;
  }

  try {
    // Intentamos obtener la IP del cliente desde los headers
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";

    // Escritura asíncrona (no bloqueante para el usuario)
    await prisma.logAuditoria.create({
      data: {
        accion,
        detalles,
        ip,
        empresaId: session.empresaId,
        userId: session.userId,
      },
    });
  } catch (error) {
    // Si falla la auditoría, no deberíamos romper el flujo principal, pero sí loguearlo en consola
    console.error("Error escribiendo log de auditoría:", error);
  }
}