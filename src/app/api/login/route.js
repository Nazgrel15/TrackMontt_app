// src/app/api/login/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { logAudit } from "@/lib/audit"; // 👈 Importamos el helper de auditoría

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }

    // 1. Buscar al usuario en la BD
    const user = await prisma.user.findFirst({ 
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

    // 3. Crear el JWT
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      empresaId: user.empresaId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    // 4. Devolver respuesta OK
    const response = NextResponse.json(payload);

    // 5. Establecer la cookie de forma segura
    response.cookies.set("tm_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
      sameSite: "Lax",
    });

    // 6. REGISTRAR AUDITORÍA (Ticket B15)
    // Construimos un objeto de sesión mínimo ya que el usuario aún no tiene la cookie
    const sessionForAudit = { 
        userId: user.id, 
        empresaId: user.empresaId 
    };
    
    // No usamos 'await' bloqueante para no retrasar el login al usuario,
    // o usamos await si queremos asegurar que se guarde antes de responder.
    await logAudit({
        session: sessionForAudit,
        accion: "login:success",
        detalles: "Inicio de sesión exitoso vía Web"
    });

    return response;

  } catch (error) {
    console.error("Error en /api/login:", error);
    if (error.code) {
       return NextResponse.json({ error: `Error de base de datos: ${error.code}` }, { status: 500 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}