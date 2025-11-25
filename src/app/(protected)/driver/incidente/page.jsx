// src/app/(protected)/driver/incidente/page.jsx
import { readRole, readSession } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import IncidenteClient from "./IncidenteClient";

export default async function IncidentePage() {
  const role = await readRole();
  const session = await readSession();

  // Solo "Chofer" puede entrar a esta ruta
  if (role !== "Chofer" || !session) {
    redirect("/dashboard");
  }

  const userId = session.userId;
  const empresaId = session.empresaId;

  // Obtener el chofer actual
  const chofer = await prisma.chofer.findUnique({
    where: { userId },
  });

  if (!chofer) {
    redirect("/dashboard");
  }

  // Buscar el servicio activo del chofer (servicio "EnCurso" o "Programado" para hoy)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const servicioActivo = await prisma.servicio.findFirst({
    where: {
      choferId: chofer.id,
      empresaId,
      fecha: {
        gte: today,
        lt: tomorrow,
      },
      estado: {
        in: ['EnCurso', 'Programado']
      }
    },
    orderBy: { fecha: 'desc' }
  });

  // Si no hay servicio activo, crear uno temporal (fallback)
  const servicioId = servicioActivo?.id || 'no-service';

  return <IncidenteClient servicioId={servicioId} />;
}