// src/app/api/attendance/[id]/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

// PUT: Ajustar estado de asistencia
export async function PUT(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: false });
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body; // Esperamos "Presente", "Ausente", "Justificado"

    if (!status) {
      return NextResponse.json({ error: "Falta el estado" }, { status: 400 });
    }

    // Actualizar registro
    // checkIn se actualiza automáticamente: si es Presente pone hora actual, si no, null.
    const updated = await prisma.asistencia.updateMany({
      where: { 
        id: id,
        empresaId: session.empresaId 
      },
      data: {
        status: status,
        checkIn: status === "Presente" ? new Date() : null
      }
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Error updating attendance:", err);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}