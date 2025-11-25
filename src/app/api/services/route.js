// src/app/api/services/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";
import { triggerWebhooks } from "@/lib/webhooks"; // 👈 Importante para Ticket B19


// GET: Listar servicios (con filtro de privacidad para choferes)
export async function GET(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: false });
  if (error) return error;

  try {
    // 1. Filtro base: Siempre por la empresa del usuario (Tenant)
    const whereClause = {
      empresaId: session.empresaId
    };

    // 2. LOGICA DE PRIVACIDAD: Si es Chofer, filtramos por SU perfil
    if (session.role === 'Chofer') {
      const choferPerfil = await prisma.chofer.findFirst({
        where: {
          userId: session.userId,
          empresaId: session.empresaId
        }
      });

      if (choferPerfil) {
        whereClause.choferId = choferPerfil.id;
      } else {
        return NextResponse.json([]);
      }
    }

    // 3. Consulta a la BD
    const services = await prisma.servicio.findMany({
      where: whereClause,
      include: {
        bus: true,
        chofer: true,
      },
      orderBy: { fecha: 'desc' }
    });

    return NextResponse.json(services);

  } catch (err) {
    console.error("Error API Services GET:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Crear nuevo servicio (Restaurado y con Webhooks)
export async function POST(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: false }); // Supervisores también crean
  if (error) return error;

  try {
    const body = await request.json();
    const { fecha, turno, paradas, busId, choferId, trabajadorIds = [] } = body;

    // Validaciones básicas
    if (!fecha || !turno || !busId || !choferId || !paradas?.length) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Crear el servicio
    const newService = await prisma.servicio.create({
      data: {
        fecha: new Date(fecha),
        turno,
        paradas,
        estado: "Programado",
        empresaId: session.empresaId,
        busId,
        choferId
      },
      include: { bus: true, chofer: true }
    });

    // ✨ CREAR REGISTROS DE ASISTENCIA AUTOMÁTICAMENTE ✨
    if (trabajadorIds.length > 0) {
      const asistenciasData = trabajadorIds.map(trabajadorId => ({
        empresaId: session.empresaId,
        servicioId: newService.id,
        trabajadorId: trabajadorId,
        status: 'Ausente', // Estado inicial
      }));

      await prisma.asistencia.createMany({
        data: asistenciasData,
        skipDuplicates: true // Evitar errores si ya existe
      });
    }

    // ✨ DISPARAR WEBHOOK (Ticket B19) ✨
    // Esto avisa a sistemas externos que se creó un servicio
    triggerWebhooks("service.created", newService, session.empresaId);

    return NextResponse.json(newService, { status: 201 });

  } catch (err) {
    console.error("Error API Services POST:", err);
    return NextResponse.json({ error: "Error al crear servicio" }, { status: 500 });
  }
}