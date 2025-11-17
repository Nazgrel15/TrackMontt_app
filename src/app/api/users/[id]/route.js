// src/app/api/users/[id]/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();
const ROLES_PERMITIDOS = ["Supervisor", "Chofer", "Administrador"];

// ... (La función GET no cambia) ...
export async function GET(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: params.id,
        empresaId: session.empresaId, 
      },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    return NextResponse.json(user);

  } catch (err) {
    console.error(`Error en GET /api/users/${params.id}:`, err.message);
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
    const { name, email, role } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Faltan campos (name, email, role)" }, { status: 400 });
    }
    if (!ROLES_PERMITIDOS.includes(role)) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
    }
    
    // ================== ARREGLO AQUÍ ==================
    // 1. Usar findFirst en lugar de findUnique
    // 2. Comprobar el email SÓLO DENTRO de la empresa actual
    const existing = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase(),
        empresaId: session.empresaId // <-- Añadido
      },
    });
    // ================================================
    
    // Si el email existe Y NO es el del usuario que estamos editando
    if (existing && existing.id !== params.id) {
      return NextResponse.json({ error: "El correo ya está en uso en esta empresa" }, { status: 409 });
    }

    const { count } = await prisma.user.updateMany({
      where: {
        id: params.id,
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

    return NextResponse.json({ id: params.id, name, email, role });

  } catch (err) {
    // ================== ARREGLO AQUÍ ==================
    // Actualizamos el nombre del constraint
    if (err.code === 'P2002' && err.meta?.target?.includes('email_empresaId_key')) {
      return NextResponse.json({ error: "El correo ya está en uso en esta empresa (constraint)" }, { status: 409 });
    }
    // ================================================
    console.error(`Error en PUT /api/users/${params.id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ... (La función DELETE no cambia y está bien) ...
export async function DELETE(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    if (params.id === session.userId) {
       return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 403 });
    }

    const { count } = await prisma.user.deleteMany({
      where: {
        id: params.id,
        empresaId: session.empresaId,
      },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Usuario no encontrado o no autorizado" }, { status: 404 });
    }

    return NextResponse.json(null, { status: 204 });

  } catch (err) {
    console.error(`Error en DELETE /api/users/${params.id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}