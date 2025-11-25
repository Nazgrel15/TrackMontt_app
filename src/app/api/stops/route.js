import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";


// GET: Listar paradas de la empresa
export async function GET(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const stops = await prisma.parada.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(stops);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Crear nueva parada
export async function POST(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const body = await request.json();
    const { nombre, lat, lng } = body;

    // Validaciones básicas
    if (!nombre || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Validar coordenadas válidas
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: "Coordenadas geográficas inválidas" }, { status: 400 });
    }

    const newStop = await prisma.parada.create({
      data: {
        nombre,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        empresaId: session.empresaId, // Asociación a empresa (Tenant)
      },
    });

    return NextResponse.json(newStop, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}