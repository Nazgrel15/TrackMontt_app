// src/app/api/drivers/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

// ... (La función GET no cambia) ...
export async function GET(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const choferes = await prisma.chofer.findMany({
      where: {
        empresaId: session.empresaId,
      },
      orderBy: {
        nombre: 'asc'
      }
    });
    return NextResponse.json(choferes);

  } catch (err) {
    console.error("Error en GET /api/drivers:", err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}


/**
 * POST /api/drivers
 * Crea un nuevo chofer en la empresa del admin.
 */
export async function POST(request) {
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

    if (existing) {
      return NextResponse.json({ error: "El RUT ya está registrado en esta empresa" }, { status: 409 });
    }

    const newChofer = await prisma.chofer.create({
      data: {
        rut,
        nombre,
        licencia: licencia.toUpperCase(),
        contacto,
        empresaId: session.empresaId,
      },
    });

    return NextResponse.json(newChofer, { status: 201 });

  } catch (err) {
    // ================== ARREGLO AQUÍ ==================
    // Actualizamos el nombre del constraint
    if (err.code === 'P2002' && err.meta?.target?.includes('rut_empresaId_key')) {
      return NextResponse.json({ error: "El RUT ya está registrado en esta empresa (constraint)" }, { status: 409 });
    }
    // ================================================
    console.error("Error en POST /api/drivers:", err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}