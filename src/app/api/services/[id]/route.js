import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";


// PUT: Actualizar servicio (incluyendo estado)
export async function PUT(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: false });
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { fecha, turno, paradas, busId, choferId, estado } = body;

    const updateData = {
      // CAMBIO AQUÍ: Forzamos mediodía UTC si se envía una fecha
      ...(fecha && { fecha: new Date(fecha + "T12:00:00Z") }),
      ...(turno && { turno }),
      ...(paradas && { paradas }),
      ...(busId && { busId }),
      ...(choferId && { choferId }),
      ...(estado && { estado }),
    };

    const { count } = await prisma.servicio.updateMany({
      where: { id, empresaId: session.empresaId },
      data: updateData,
    });

    if (count === 0) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Cancelar/Borrar servicio
export async function DELETE(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: false });
  if (error) return error;

  try {
    const { id } = await params;
    const { count } = await prisma.servicio.deleteMany({
      where: { id, empresaId: session.empresaId },
    });

    if (count === 0) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}