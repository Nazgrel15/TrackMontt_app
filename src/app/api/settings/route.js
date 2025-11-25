// src/app/api/settings/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit"; // 👈 Importamos el helper de auditoría


export async function GET(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const settings = await prisma.empresa.findUnique({
      where: { id: session.empresaId },
      select: {
        toleranciaRetraso: true,
        retencionDatosDias: true,
        factorCO2: true,
        ventanaInicio: true,
        ventanaFin: true
      }
    });

    return NextResponse.json(settings);
  } catch (err) {
    return NextResponse.json({ error: "Error al cargar configuración" }, { status: 500 });
  }
}

export async function PUT(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const body = await request.json();
    const tolerancia = parseInt(body.toleranciaRetraso);
    const retencion = parseInt(body.retencionDatosDias);
    const co2 = parseFloat(body.factorCO2);
    const { ventanaInicio, ventanaFin } = body; 

    if (isNaN(tolerancia) || isNaN(retencion) || isNaN(co2)) {
      return NextResponse.json({ error: "Valores numéricos inválidos" }, { status: 400 });
    }

    const updated = await prisma.empresa.update({
      where: { id: session.empresaId },
      data: {
        toleranciaRetraso: tolerancia,
        retencionDatosDias: retencion,
        factorCO2: co2,
        ventanaInicio: ventanaInicio,
        ventanaFin: ventanaFin
      }
    });

    // REGISTRAR AUDITORÍA (Ticket B15)
    await logAudit({
        session,
        accion: "update:settings",
        detalles: `Actualizó parámetros: Tolerancia=${tolerancia}, Retención=${retencion}, CO2=${co2}`
    });

    return NextResponse.json({ success: true, data: updated });

  } catch (err) {
    console.error("Error settings PUT:", err);
    return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 });
  }
}