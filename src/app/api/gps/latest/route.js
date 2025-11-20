import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

export async function GET(request) {
  const { session, error } = await getApiSession(request);
  if (error) return error;

  try {
    // Buscamos los servicios que están "EnCurso" de esta empresa
    const activeServices = await prisma.servicio.findMany({
      where: {
        empresaId: session.empresaId,
        estado: "EnCurso" // Solo nos interesan los que se están moviendo
      },
      include: {
        bus: true,
        chofer: true,
        // Traemos el ÚLTIMO log de posición
        posicionesGPS: {
          take: 1,
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    // Formateamos la respuesta para que el mapa la entienda fácil
    const fleetData = activeServices
      .filter(s => s.posicionesGPS.length > 0) // Solo los que tienen al menos 1 señal
      .map(s => ({
        servicioId: s.id,
        busPatente: s.bus?.patente,
        choferNombre: s.chofer?.nombre,
        lat: s.posicionesGPS[0].lat,
        lng: s.posicionesGPS[0].lng,
        timestamp: s.posicionesGPS[0].timestamp,
        ruta: `${s.paradas[0]} -> ${s.paradas[s.paradas.length - 1]}`
      }));

    return NextResponse.json(fleetData);

  } catch (err) {
    console.error("Error GPS Latest:", err);
    return NextResponse.json({ error: "Error obteniendo flota" }, { status: 500 });
  }
}