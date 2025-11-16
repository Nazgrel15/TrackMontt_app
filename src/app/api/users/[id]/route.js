// src/app/api/users/[id]/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();
const ROLES_PERMITIDOS = ["Supervisor", "Chofer", "Administrador"]; // Admin puede editarse a sí mismo

/**
 * GET /api/users/[id]
 * Obtiene un usuario específico, solo si pertenece a la empresa del admin.
 */
export async function GET(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: params.id,
        empresaId: session.empresaId, // <-- Multi-tenant check
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
 * Omitimos el cambio de contraseña aquí por simplicidad.
 */
export async function PUT(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const { name, email, role } = await request.json();

    // 1. Validaciones
    if (!name || !email || !role) {
      return NextResponse.json({ error: "Faltan campos (name, email, role)" }, { status: 400 });
    }
    if (!ROLES_PERMITIDOS.includes(role)) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
    }
    
    // (Opcional pero recomendado) Si cambia el email, verificar que no esté tomado
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    // Si el email existe Y NO es el del usuario que estamos editando
    if (existing && existing.id !== params.id) {
      return NextResponse.json({ error: "El correo ya está en uso" }, { status: 409 });
    }

    // 2. Actualizar usando updateMany para garantizar el chequeo de empresaId
    const { count } = await prisma.user.updateMany({
      where: {
        id: params.id,
        empresaId: session.empresaId, // <-- Multi-tenant check
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
    console.error(`Error en PUT /api/users/${params.id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[id]
 * Elimina un usuario, solo si pertenece a la empresa del admin.
 */
export async function DELETE(request, { params }) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    // 1. No permitir que un admin se borre a sí mismo
    if (params.id === session.userId) {
       return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 403 });
    }

    // 2. Borrar usando deleteMany para garantizar el chequeo de empresaId
    const { count } = await prisma.user.deleteMany({
      where: {
        id: params.id,
        empresaId: session.empresaId, // <-- Multi-tenant check
      },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Usuario no encontrado o no autorizado" }, { status: 404 });
    }

    return NextResponse.json(null, { status: 204 }); // 204 = No Content (Éxito)

  } catch (err) {
    console.error(`Error en DELETE /api/users/${params.id}:`, err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}