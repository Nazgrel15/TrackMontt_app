import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

// GET: Listar servicios (con relaciones) - (Sin cambios)
export async function GET(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: false });
  if (error) return error;

  try {
    // 1. Buscamos si el usuario logueado es un Chofer
    const perfilChofer = await prisma.chofer.findUnique({
      where: { userId: session.userId } 
    });

    // 2. Filtro base: servicios de la empresa
    let whereCondition = { empresaId: session.empresaId };

    // 3. Si es chofer, SOLO devolvemos SUS servicios
    if (session.role === "Chofer" && perfilChofer) {
      whereCondition.choferId = perfilChofer.id;
    }

    const services = await prisma.servicio.findMany({
      where: whereCondition,
      include: {
        bus: true,
        chofer: true,
      },
      orderBy: { fecha: 'desc' }
    });
    return NextResponse.json(services);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Crear servicio
export async function POST(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: false });
  if (error) return error;

  try {
    const body = await request.json();
    const { fecha, turno, paradas, busId, choferId } = body;

    // Validaciones
    if (!fecha || !turno || !busId || !choferId || !paradas?.length) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Crear el servicio (Estado por defecto: "Programado")
    const newService = await prisma.servicio.create({
      data: {
        // CAMBIO AQUÍ: Forzamos mediodía UTC para evitar problemas de zona horaria
        fecha: new Date(fecha + "T12:00:00Z"), 
        turno,
        paradas, // Array de strings (nombres)
        busId,
        choferId,
        estado: "Programado",
        empresaId: session.empresaId,
      },
      include: { bus: true, chofer: true }
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al crear servicio" }, { status: 500 });
  }
}