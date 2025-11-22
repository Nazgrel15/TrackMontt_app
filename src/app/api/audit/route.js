// src/app/api/audit/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

export async function GET(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    // Traer logs de la empresa, incluyendo datos del usuario
    const logs = await prisma.logAuditoria.findMany({
      where: { empresaId: session.empresaId },
      include: {
        user: {
          select: { email: true, name: true }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 100 // Límite para MVP
    });

    // Formatear para el frontend
    const formatted = logs.map(l => ({
      id: l.id,
      timestamp: l.timestamp,
      user: l.user?.email || "Usuario Eliminado",
      action: l.accion,
      details: l.detalles || "-",
      ip: l.ip || "-"
    }));

    return NextResponse.json(formatted);

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al cargar auditoría" }, { status: 500 });
  }
}