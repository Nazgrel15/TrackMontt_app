// src/app/api/workers/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";


// PUT: Actualizar trabajador
export async function PUT(request, { params }) {
  // 1. Permitimos acceso a roles no-admin (Supervisores), pero validamos sesión
  const { session, error } = await getApiSession(request, { requireAdmin: false });
  if (error) return error;

  // 2. Bloqueo de seguridad: Los Choferes NO pueden editar trabajadores
  if (session.role === "Chofer") {
    return NextResponse.json({ error: "No tienes permisos para esta acción" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { rut, nombre, area } = await request.json();

    // Validar que vengan datos mínimos si es necesario, o confiar en el frontend
    if (!rut || !nombre) {
       return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // 3. Actualizar registro asegurando que pertenezca a la empresa (Tenant)
    const updated = await prisma.trabajador.updateMany({
      where: { 
        id: id, 
        empresaId: session.empresaId 
      },
      data: { rut, nombre, area }
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Trabajador no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Error PUT worker:", err);
    return NextResponse.json({ error: "Error interno al actualizar" }, { status: 500 });
  }
}

// DELETE: Eliminar trabajador
export async function DELETE(request, { params }) {
  // 1. Permitimos acceso a roles no-admin (Supervisores), pero validamos sesión
  const { session, error } = await getApiSession(request, { requireAdmin: false });
  if (error) return error;

  // 2. Bloqueo de seguridad: Los Choferes NO pueden eliminar trabajadores
  if (session.role === "Chofer") {
    return NextResponse.json({ error: "No tienes permisos para esta acción" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // 3. Limpieza de datos relacionados (Asistencias)
    // Primero borramos sus asistencias para mantener la integridad referencial
    await prisma.asistencia.deleteMany({
        where: { 
          trabajadorId: id, 
          empresaId: session.empresaId 
        }
    });

    // 4. Eliminar al trabajador
    const deleted = await prisma.trabajador.deleteMany({
      where: { 
        id: id, 
        empresaId: session.empresaId 
      }
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Trabajador no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error("Error DELETE worker:", err);
    return NextResponse.json({ error: "Error interno al eliminar" }, { status: 500 });
  }
}