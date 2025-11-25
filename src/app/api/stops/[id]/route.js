// src/app/api/stops/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";


// PUT: Actualizar parada
export async function PUT(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    // CORRECCIÓN: Esperar params
    const { id } = await params;
    
    const { nombre, lat, lng } = await request.json();

    // Validar coordenadas si se envían
    if (lat !== undefined && (lat < -90 || lat > 90)) {
      return NextResponse.json({ error: "Latitud inválida" }, { status: 400 });
    }
    if (lng !== undefined && (lng < -180 || lng > 180)) {
      return NextResponse.json({ error: "Longitud inválida" }, { status: 400 });
    }

    // updateMany asegura que solo edites si pertenece a tu empresa
    const { count } = await prisma.parada.updateMany({
      where: { 
        id, 
        empresaId: session.empresaId 
      },
      data: { 
        nombre, 
        lat: lat ? parseFloat(lat) : undefined, 
        lng: lng ? parseFloat(lng) : undefined 
      },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Parada no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Eliminar parada
export async function DELETE(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    // CORRECCIÓN: Esperar params
    const { id } = await params;

    const { count } = await prisma.parada.deleteMany({
      where: { 
        id, 
        empresaId: session.empresaId 
      },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Parada no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Manejo de error si la parada está en uso (Foreign Key)
    if (err.code === 'P2003') {
       return NextResponse.json({ error: "No se puede eliminar: la parada está asignada a rutas activas." }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}