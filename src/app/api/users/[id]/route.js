// src/app/api/users/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";

const ROLES_PERMITIDOS = ["Supervisor", "Chofer", "Administrador"];

export async function GET(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    // CORRECCIÓN: Esperar params
    const { id } = await params;

    const user = await prisma.user.findFirst({
      where: {
        id: id, // Usamos la variable id
        empresaId: session.empresaId, 
      },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    return NextResponse.json(user);

  } catch (err) {
    const { id } = await params;
    console.error(`Error en GET /api/users/${id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

/**
 * PUT /api/users/[id]
 * Actualiza un usuario (solo name, email, role).
 */
export async function PUT(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    // CORRECCIÓN: Esperar params
    const { id } = await params;
    const { name, email, role } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Faltan campos (name, email, role)" }, { status: 400 });
    }
    if (!ROLES_PERMITIDOS.includes(role)) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
    }
    
    // 1. Usar findFirst en lugar de findUnique
    // 2. Comprobar el email SÓLO DENTRO de la empresa actual
    const existing = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase(),
        empresaId: session.empresaId 
      },
    });
    
    // Si el email existe Y NO es el del usuario que estamos editando
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "El correo ya está en uso en esta empresa" }, { status: 409 });
    }

    const { count } = await prisma.user.updateMany({
      where: {
        id: id, // Usamos la variable id
        empresaId: session.empresaId,
      },
      data: {
        name,
        email: email.toLowerCase(),
        role,
      },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Usuario no encontrado o no autorizado" }, { status: 404 });
    }

    return NextResponse.json({ id, name, email, role });

  } catch (err) {
    const { id } = await params;
    // Actualizamos el nombre del constraint
    if (err.code === 'P2002' && err.meta?.target?.includes('email_empresaId_key')) {
      return NextResponse.json({ error: "El correo ya está en uso en esta empresa (constraint)" }, { status: 409 });
    }
    console.error(`Error en PUT /api/users/${id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    // CORRECCIÓN: Esperar params
    const { id } = await params;

    if (id === session.userId) {
       return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 403 });
    }

    const { count } = await prisma.user.deleteMany({
      where: {
        id: id, // Usamos la variable id
        empresaId: session.empresaId,
      },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Usuario no encontrado o no autorizado" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });

  } catch (err) {
    const { id } = await params;
    console.error(`Error en DELETE /api/users/${id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}