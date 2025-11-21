// src/app/api/services/clone/[id]/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  const { session, error } = await getApiSession(request);
  if (error) return error;

  try {
    const { id } = await params;
    
    const body = await request.json().catch(() => ({})); 
    const { fecha } = body;

    const original = await prisma.servicio.findUnique({
      where: { 
        id: id,
        empresaId: session.empresaId 
      }
    });

    if (!original) {
      return NextResponse.json({ error: "Servicio original no encontrado" }, { status: 404 });
    }

    let nuevaFecha;
    if (fecha) {
      // ================== CORRECCIÓN AQUÍ ==================
      // 1. El input fecha viene como "YYYY-MM-DD" (ej: "2025-11-25")
      // 2. Le pegamos "T12:00:00Z" para fijarlo a mediodía UTC.
      //    Así, en Chile (UTC-3) será las 09:00 AM del MISMO DÍA.
      nuevaFecha = new Date(`${fecha}T12:00:00Z`);
      // =====================================================
    } else {
      // Default: Mañana del original
      const d = new Date(original.fecha);
      d.setDate(d.getDate() + 1);
      nuevaFecha = d;
    }

    const nuevoServicio = await prisma.servicio.create({
      data: {
        fecha: nuevaFecha,
        turno: original.turno,
        paradas: original.paradas,
        estado: "Programado",
        empresaId: session.empresaId,
        busId: original.busId,
        choferId: original.choferId,
      },
      include: {
        bus: true,
        chofer: true
      }
    });

    return NextResponse.json(nuevoServicio, { status: 201 });

  } catch (err) {
    console.error("Error clonando servicio:", err);
    return NextResponse.json({ error: "Error interno al clonar" }, { status: 500 });
  }
}