import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";


export async function POST(request) {
  // Choferes y Supervisores pueden enviar datos (o solo choferes, según tu regla)
  const { session, error } = await getApiSession(request); 
  if (error) return error;

  try {
    const body = await request.json();
    // Esperamos servicioId porque el LogPosicion está atado a un Servicio, no solo al Bus
    const { lat, lng, servicioId } = body;

    if (!lat || !lng || !servicioId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // 1. Persistir en BD (Historial)
    const log = await prisma.logPosicion.create({
      data: {
        lat: Number(lat),
        lng: Number(lng),
        servicioId,
        empresaId: session.empresaId,
        timestamp: new Date(),
      },
    });

    // 2. Opcional: Podríamos actualizar una tabla "LastPosition" si quisiéramos optimizar,
    // pero para el MVP consultaremos el último Log.

    return NextResponse.json({ success: true, id: log.id }, { status: 201 });

  } catch (err) {
    console.error("Error GPS:", err);
    return NextResponse.json({ error: "Error al procesar telemetría" }, { status: 500 });
  }
}