import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

// GET: Obtener asistencia actual de un servicio
export async function GET(request) {
  const { session, error } = await getApiSession(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");

  if (!serviceId) return NextResponse.json([]);

  try {
    const attendance = await prisma.asistencia.findMany({
      where: {
        servicioId,
        empresaId: session.empresaId
      }
    });
    return NextResponse.json(attendance);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Registrar pasajeros (Bulk Check-in)
export async function POST(request) {
  const { session, error } = await getApiSession(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { serviceId, passengers } = body; // passengers = [{ workerId, status }]

    if (!serviceId || !passengers || !Array.isArray(passengers)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const results = [];

    // Procesamos uno a uno para validar duplicados (Upsert logic)
    for (const p of passengers) {
      // Buscamos si ya existe registro para este trabajador en este servicio
      const existing = await prisma.asistencia.findUnique({
        where: {
          servicioId_trabajadorId: {
            servicioId: serviceId,
            trabajadorId: p.workerId
          }
        }
      });

      if (existing) {
        // Si existe, actualizamos el estado (ej. de 'Presente' a 'Ausente' o viceversa)
        const updated = await prisma.asistencia.update({
          where: { id: existing.id },
          data: {
            status: p.status,
            // Solo actualizamos fecha si está marcando "Presente"
            checkIn: p.status === 'Presente' ? new Date() : existing.checkIn
          }
        });
        results.push(updated);
      } else {
        // Si no existe, creamos el registro
        const created = await prisma.asistencia.create({
          data: {
            servicioId,
            trabajadorId: p.workerId,
            status: p.status,
            checkIn: p.status === 'Presente' ? new Date() : null,
            empresaId: session.empresaId
          }
        });
        results.push(created);
      }
    }

    return NextResponse.json({ success: true, count: results.length }, { status: 201 });

  } catch (err) {
    console.error("Error attendance:", err);
    return NextResponse.json({ error: "Error al registrar asistencia" }, { status: 500 });
  }
}