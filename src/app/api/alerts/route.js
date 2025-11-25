// src/app/api/alerts/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";


export async function GET(request) {
  const { session, error } = await getApiSession(request);
  if (error) return error;

  try {
    // Obtenemos alertas de la empresa, ordenadas por las más recientes
    const alertas = await prisma.alerta.findMany({
      where: {
        empresaId: session.empresaId,
      },
      include: {
        servicio: {
          include: { bus: true, chofer: true }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 50 // Límite para no saturar la vista
    });

    return NextResponse.json(alertas);
  } catch (err) {
    console.error("Error fetching alerts:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}