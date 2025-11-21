import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

// GET: Listar trabajadores (para selección en asistencia)
export async function GET(request) {
  const { session, error } = await getApiSession(request);
  if (error) return error;

  try {
    const workers = await prisma.trabajador.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(workers);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Crear trabajador (útil para poblar la base si no existe aún el módulo de admin)
export async function POST(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true }); // Solo admin crea
  if (error) return error;

  try {
    const { rut, nombre, area } = await request.json();
    if (!rut || !nombre) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

    const newWorker = await prisma.trabajador.create({
      data: {
        rut,
        nombre,
        area: area || "General",
        empresaId: session.empresaId
      }
    });
    return NextResponse.json(newWorker, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}