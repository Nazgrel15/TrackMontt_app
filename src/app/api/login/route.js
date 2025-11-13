// src/app/api/login/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }

    // 1. Buscar al usuario en la BD
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // 2. Validar contraseña
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // 3. Crear el JWT (AC del Ticket B1)
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      empresaId: user.empresaId, // <-- ¡La clave del SaaS!
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    // 4. Devolver respuesta OK con los datos del usuario
    const response = NextResponse.json(payload);

    // 5. Establecer la cookie de forma segura
    response.cookies.set("tm_auth", token, {
      httpOnly: true, // El navegador no puede leer esta cookie
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
      sameSite: "Lax",
    });

    return response;

  } catch (error) {
    console.error("Error en /api/login:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}