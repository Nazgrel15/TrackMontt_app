import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const { id } = await params; // <--- AWAIT

    const bus = await prisma.bus.findFirst({
      where: { id, empresaId: session.empresaId },
    });

    if (!bus) return NextResponse.json({ error: "Bus no encontrado" }, { status: 404 });
    return NextResponse.json(bus);

  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const { id } = await params; // <--- AWAIT
    const { patente, capacidad, proveedor } = await request.json();

    // (Validaciones omitidas por brevedad, mantenlas igual)

    const existing = await prisma.bus.findUnique({ where: { patente: patente.toUpperCase() } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "Patente duplicada" }, { status: 409 });
    }

    const { count } = await prisma.bus.updateMany({
      where: { id, empresaId: session.empresaId },
      data: { patente: patente.toUpperCase(), capacidad: Number(capacidad), proveedor },
    });

    if (count === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    return NextResponse.json({ id, patente, capacidad, proveedor });

  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const { id } = await params; // <--- AWAIT

    const { count } = await prisma.bus.deleteMany({
      where: { id, empresaId: session.empresaId },
    });

    if (count === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return new NextResponse(null, { status: 204 });

  } catch (err) {
    if (err.code === 'P2003') return NextResponse.json({ error: "Bus en uso" }, { status: 409 });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}