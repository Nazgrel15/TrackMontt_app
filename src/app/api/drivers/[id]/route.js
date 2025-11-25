import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";


export async function GET(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    // CORRECCIÓN: Esperar params
    const { id } = await params; 

    const chofer = await prisma.chofer.findFirst({
      where: {
        id: id, // Usamos la variable id extraída
        empresaId: session.empresaId,
      },
    });

    if (!chofer) {
      return NextResponse.json({ error: "Chofer no encontrado" }, { status: 404 });
    }
    return NextResponse.json(chofer);

  } catch (err) {
    const { id } = await params; // Necesario para el log de error
    console.error(`Error en GET /api/drivers/${id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    // CORRECCIÓN: Esperar params
    const { id } = await params;
    const { rut, nombre, licencia, contacto } = await request.json();

    if (!rut || !nombre || !licencia || !contacto) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    // Validar RUT único (excluyendo al actual)
    const existing = await prisma.chofer.findFirst({
      where: { 
        rut: rut,
        empresaId: session.empresaId 
      },
    });

    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "Ese RUT ya pertenece a otro chofer" }, { status: 409 });
    }

    const { count } = await prisma.chofer.updateMany({
      where: {
        id: id,
        empresaId: session.empresaId,
      },
      data: { rut, nombre, licencia: licencia.toUpperCase(), contacto },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Chofer no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ id, rut, nombre, licencia, contacto });

  } catch (err) {
    const { id } = await params;
    if (err.code === 'P2002') {
      return NextResponse.json({ error: "Datos duplicados" }, { status: 409 });
    }
    console.error(`Error en PUT /api/drivers/${id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    // CORRECCIÓN: Esperar params
    const { id } = await params;

    const { count } = await prisma.chofer.deleteMany({
      where: {
        id: id,
        empresaId: session.empresaId,
      },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Chofer no encontrado" }, { status: 404 });
    }

    // CAMBIO: Usar 'new NextResponse' para status 204 (sin cuerpo)
    return new NextResponse(null, { status: 204 });

  } catch (err) {
    const { id } = await params;
    if (err.code === 'P2003') {
      return NextResponse.json({ error: "No se puede eliminar el chofer, está asignado a servicios" }, { status: 409 });
    }
    console.error(`Error en DELETE /api/drivers/${id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 