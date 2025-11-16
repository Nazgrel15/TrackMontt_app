// src/app/api/users/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth"; // Nuestro helper
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const ROLES_PERMITIDOS = ["Supervisor", "Chofer"]; // Un admin no puede crear otro Admin desde aquí

/**
 * GET /api/users
 * Obtiene todos los usuarios de la empresa del admin.
 */
export async function GET(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const users = await prisma.user.findMany({
      where: {
        empresaId: session.empresaId, // <-- CLAVE: Solo usuarios de su empresa
      },
      select: { // No exponer el hash de la contraseña
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

    // 1. Validaciones
    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: "Faltan campos (name, email, role, password)" }, { status: 400 });
    }
    if (!ROLES_PERMITIDOS.includes(role)) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
    }

    // 2. (AC 2) Verificar unicidad de email (basado en tu schema.prisma)
    // Nota: Tu schema tiene email @unique global. Ver "Paso 4".
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "El correo ya está en uso" }, { status: 409 });
    }

    // 3. Hashear contraseña (como en seed.js)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear usuario
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        role,
        hashedPassword,
        empresaId: session.empresaId, // <-- CLAVE: Se asigna a su empresa
      },
      select: { // Devolver el usuario sin la contraseña
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });

  } catch (err) {
    console.error("Error en POST /api/users:", err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}