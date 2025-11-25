// src/app/api/buses/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth"; // Nuestro helper de autenticación


/**
 * GET /api/buses
 * Obtiene toda la flota de la empresa del admin.
 */
export async function GET(request) {
  // 1. Validar sesión de Administrador
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    // 2. Buscar buses SÓLO de la empresaId del admin
    const buses = await prisma.bus.findMany({
      where: {
        empresaId: session.empresaId,
      },
      orderBy: {
        patente: 'asc' // Ordenar por patente
      }
    });
    return NextResponse.json(buses);

  } catch (err) {
    console.error("Error en GET /api/buses:", err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

/**
 * POST /api/buses
 * Crea un nuevo bus en la empresa del admin.
 */
export async function POST(request) {
  // 1. Validar sesión de Administrador
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const { patente, capacidad, proveedor } = await request.json();

    // 2. Validar campos
    if (!patente || !capacidad || !proveedor) {
      return NextResponse.json({ error: "Faltan campos (patente, capacidad, proveedor)" }, { status: 400 });
    }
    if (isNaN(Number(capacidad)) || Number(capacidad) <= 0) {
      return NextResponse.json({ error: "La capacidad debe ser un número positivo" }, { status: 400 });
    }

    // 3. (AC: Patente única) Prisma ya maneja esto por el @unique en el schema
    //
    // Podemos añadir un chequeo manual para un mejor error
    const existing = await prisma.bus.findUnique({
      where: { patente: patente.toUpperCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "La patente ya está registrada" }, { status: 409 });
    }

    // 4. Crear el bus
    const newBus = await prisma.bus.create({
      data: {
        patente: patente.toUpperCase(),
        capacidad: Number(capacidad),
        proveedor,
        empresaId: session.empresaId, // (AC: Relación con empresa)
      },
    });

    return NextResponse.json(newBus, { status: 201 });

  } catch (err) {
    // Manejar error de patente única de Prisma
    if (err.code === 'P2002' && err.meta?.target?.includes('patente')) {
      return NextResponse.json({ error: "La patente ya está registrada" }, { status: 409 });
    }
    console.error("Error en POST /api/buses:", err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}