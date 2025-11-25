// src/app/api/users/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth"; // Nuestro helper
import bcrypt from "bcryptjs";

const ROLES_PERMITIDOS = ["Supervisor", "Chofer"];

// ... (La función GET no cambia y está bien) ...
export async function GET(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const users = await prisma.user.findMany({
      where: {
        empresaId: session.empresaId, 
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    return NextResponse.json(users);

  } catch (err) {
    console.error("Error en GET /api/users:", err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

/**
 * POST /api/users
 * Crea un nuevo usuario (Supervisor o Chofer) en la empresa del admin.
 */
export async function POST(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const { name, email, role, password } = await request.json();

    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: "Faltan campos (name, email, role, password)" }, { status: 400 });
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

    if (existing) {
      return NextResponse.json({ error: "El correo ya está en uso en esta empresa" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        role,
        hashedPassword,
        empresaId: session.empresaId, 
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });

  } catch (err) {
    // ================== ARREGLO AQUÍ ==================
    // Actualizamos el nombre del constraint
    if (err.code === 'P2002' && err.meta?.target?.includes('email_empresaId_key')) {
      return NextResponse.json({ error: "El correo ya está en uso en esta empresa (constraint)" }, { status: 409 });
    }
    // ================================================
    console.error("Error en POST /api/users:", err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}