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

    // Para alertas de tipo "Incidente:", buscar el incidente relacionado
    const alertasConIncidentes = await Promise.all(
      alertas.map(async (alerta) => {
        if (alerta.tipo?.startsWith('Incidente:')) {
          // Buscar el incidente más reciente que coincida con el timestamp aproximado
          const incidente = await prisma.incidente.findFirst({
            where: {
              empresaId: session.empresaId,
              timestamp: {
                gte: new Date(alerta.timestamp.getTime() - 5000), // 5 segundos antes
                lte: new Date(alerta.timestamp.getTime() + 5000), // 5 segundos después
              }
            },
            orderBy: { timestamp: 'desc' }
          });

          if (incidente) {
            return { ...alerta, incidente };
          }
        }
        return alerta;
      })
    );

    return NextResponse.json(alertasConIncidentes);
  } catch (err) {
    console.error("Error fetching alerts:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}