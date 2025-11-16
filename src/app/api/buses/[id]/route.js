// src/app/api/buses/[id]/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

/**
 * GET /api/buses/[id]
 * Obtiene un bus específico, solo si pertenece a la empresa del admin.
 */
export async function GET(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const bus = await prisma.bus.findFirst({
      where: {
        id: params.id,
        empresaId: session.empresaId, // <-- Multi-tenant check
      },
    });

    if (!bus) {
      return NextResponse.json({ error: "Bus no encontrado" }, { status: 404 });
    }
    return NextResponse.json(bus);

  } catch (err) {
    console.error(`Error en GET /api/buses/${params.id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

/**
 * PUT /api/buses/[id]
 * Actualiza un bus (patente, capacidad, proveedor).
 */
export async function PUT(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const { patente, capacidad, proveedor } = await request.json();

    // 1. Validaciones
    if (!patente || !capacidad || !proveedor) {
      return NextResponse.json({ error: "Faltan campos (patente, capacidad, proveedor)" }, { status: 400 });
    }
    if (isNaN(Number(capacidad)) || Number(capacidad) <= 0) {
      return NextResponse.json({ error: "La capacidad debe ser un número positivo" }, { status: 400 });
    }

    // 2. (AC: Patente única)
    const existing = await prisma.bus.findUnique({
      where: { patente: patente.toUpperCase() },
    });
    // Si la patente existe Y NO es la del bus que estamos editando
    if (existing && existing.id !== params.id) {
      return NextResponse.json({ error: "Esa patente ya pertenece a otro bus" }, { status: 409 });
    }

    // 3. Actualizar usando updateMany para garantizar el chequeo de empresaId
    const { count } = await prisma.bus.updateMany({
      where: {
        id: params.id,
        empresaId: session.empresaId, // <-- Multi-tenant check
      },
      data: {
        patente: patente.toUpperCase(),
        capacidad: Number(capacidad),
        proveedor,
      },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Bus no encontrado o no autorizado" }, { status: 404 });
    }

    return NextResponse.json({ id: params.id, patente, capacidad, proveedor });

  } catch (err) {
    if (err.code === 'P2002' && err.meta?.target?.includes('patente')) {
      return NextResponse.json({ error: "Esa patente ya pertenece a otro bus" }, { status: 409 });
    }
    console.error(`Error en PUT /api/buses/${params.id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

/**
 * DELETE /api/buses/[id]
 * Elimina un bus, solo si pertenece a la empresa del admin.
 */
export async function DELETE(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    // Borrar usando deleteMany para garantizar el chequeo de empresaId
    const { count } = await prisma.bus.deleteMany({
      where: {
        id: params.id,
        empresaId: session.empresaId, // <-- Multi-tenant check
      },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Bus no encontrado o no autorizado" }, { status: 404 });
    }

    return NextResponse.json(null, { status: 204 }); // 204 = No Content (Éxito)

  } catch (err) {
    // Manejar error si el bus está en uso (ej. en un Servicio)
    if (err.code === 'P2003') {
      return NextResponse.json({ error: "No se puede eliminar el bus, está asignado a uno o más servicios" }, { status: 409 });
    }
    console.error(`Error en DELETE /api/buses/${params.id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}