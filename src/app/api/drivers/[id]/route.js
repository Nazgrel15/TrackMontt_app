// src/app/api/drivers/[id]/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

// ... (La función GET no cambia) ...
export async function GET(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const chofer = await prisma.chofer.findFirst({
      where: {
        id: params.id,
        empresaId: session.empresaId,
      },
    });

    if (!chofer) {
      return NextResponse.json({ error: "Chofer no encontrado" }, { status: 404 });
    }
    return NextResponse.json(chofer);

  } catch (err) {
    console.error(`Error en GET /api/drivers/${params.id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}


/**
 * PUT /api/drivers/[id]
 * Actualiza un chofer (rut, nombre, licencia, contacto).
 */
export async function PUT(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const { rut, nombre, licencia, contacto } = await request.json();

    if (!rut || !nombre || !licencia || !contacto) {
      return NextResponse.json({ error: "Faltan campos (rut, nombre, licencia, contacto)" }, { status: 400 });
    }

    // ================== ARREGLO AQUÍ ==================
    // (AC: Rut único) Cambiamos findUnique por findFirst
    // y añadimos el filtro de empresaId
    const existing = await prisma.chofer.findFirst({
      where: { 
        rut: rut,
        empresaId: session.empresaId // <-- Añadido
      },
    });
    // ================================================

    // Si el RUT existe Y NO es el del chofer que estamos editando
    if (existing && existing.id !== params.id) {
      return NextResponse.json({ error: "Ese RUT ya pertenece a otro chofer en esta empresa" }, { status: 409 });
    }

    // 2. Actualizar
    const { count } = await prisma.chofer.updateMany({
      where: {
        id: params.id,
        empresaId: session.empresaId,
      },
      data: {
        rut,
        nombre,
        licencia: licencia.toUpperCase(),
        contacto,
      },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Chofer no encontrado o no autorizado" }, { status: 404 });
    }

    return NextResponse.json({ id: params.id, rut, nombre, licencia, contacto });

  } catch (err) {
    // ================== ARREGLO AQUÍ ==================
    // Actualizamos el nombre del constraint
    if (err.code === 'P2002' && err.meta?.target?.includes('rut_empresaId_key')) {
      return NextResponse.json({ error: "Ese RUT ya pertenece a otro chofer (constraint)" }, { status: 409 });
    }
    // ================================================
    console.error(`Error en PUT /api/drivers/${params.id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ... (La función DELETE no cambia y está correcta) ...
export async function DELETE(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    // Borrar usando deleteMany para garantizar el chequeo de empresaId
    const { count } = await prisma.chofer.deleteMany({
      where: {
        id: params.id,
        empresaId: session.empresaId, // <-- Multi-tenant check
      },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Chofer no encontrado o no autorizado" }, { status: 404 });
    }

    return NextResponse.json(null, { status: 204 }); // 204 = No Content (Éxito)

  } catch (err) {
    // (AC: Relación opcional)
    // Manejar error si el chofer está en uso (ej. en un Servicio)
    if (err.code === 'P2003') {
      return NextResponse.json({ error: "No se puede eliminar el chofer, está asignado a uno o más servicios" }, { status: 409 });
    }
    console.error(`Error en DELETE /api/drivers/${params.id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}