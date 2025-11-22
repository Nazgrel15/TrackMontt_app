// src/app/api/attendance/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

// GET: Consultar asistencia (Por servicio o general)
export async function GET(request) {
  const { session, error } = await getApiSession(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");

  try {
    const whereClause = {
      empresaId: session.empresaId,
      ...(serviceId && { servicioId: serviceId }) // Filtro opcional
    };

    const attendance = await prisma.asistencia.findMany({
      where: whereClause,
      include: {
        trabajador: true, // Traer nombre y RUT
        servicio: {       // Traer info del servicio
          select: { fecha: true, turno: true, paradas: true } 
        }
      },
      orderBy: {
        servicio: { fecha: 'desc' } // Más reciente primero
      },
      take: serviceId ? undefined : 100 // Si es general, limitar a 100
    });

    return NextResponse.json(attendance);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: (Mantenlo igual que en B8)
export async function POST(request) {
  // ... (El código del POST que ya tenías, no lo borres)
  const { session, error } = await getApiSession(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { serviceId, passengers } = body;

    if (!serviceId || !passengers) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });

    const operations = passengers.map(p => 
      prisma.asistencia.upsert({
        where: {
          servicioId_trabajadorId: {
            servicioId: serviceId,
            trabajadorId: p.workerId
          }
        },
        update: {
          status: p.status,
          checkIn: p.status === 'Presente' ? new Date() : null
        },
        create: {
          servicioId: serviceId,
          trabajadorId: p.workerId,
          status: p.status,
          checkIn: p.status === 'Presente' ? new Date() : null,
          empresaId: session.empresaId
        }
      })
    );

    await prisma.$transaction(operations);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Error marcando asistencia:", err);
    return NextResponse.json({ error: "Error al guardar asistencia" }, { status: 500 });
  }
}