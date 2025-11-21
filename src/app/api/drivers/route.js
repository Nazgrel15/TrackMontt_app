// src/app/api/drivers/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 1. Método GET (Faltaba o estaba incompleto)
export async function GET(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const choferes = await prisma.chofer.findMany({
      where: {
        empresaId: session.empresaId,
      },
      orderBy: {
        nombre: 'asc'
      }
    });
    return NextResponse.json(choferes);

  } catch (err) {
    console.error("Error en GET /api/drivers:", err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// 2. Método POST (Con creación de usuario)
export async function POST(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const { rut, nombre, licencia, contacto, email } = await request.json();

    // Validaciones
    if (!rut || !nombre || !licencia || !contacto) {
      return NextResponse.json({ error: "Faltan datos del chofer" }, { status: 400 });
    }
    
    if (!email) {
       return NextResponse.json({ error: "El correo es obligatorio para crear la cuenta de acceso" }, { status: 400 });
    }

    // Verificar RUT duplicado
    const existingRut = await prisma.chofer.findFirst({
      where: { rut, empresaId: session.empresaId },
    });
    if (existingRut) return NextResponse.json({ error: "RUT ya registrado" }, { status: 409 });

    // Verificar Email duplicado
    const existingEmail = await prisma.user.findFirst({
      where: { email, empresaId: session.empresaId },
    });
    if (existingEmail) return NextResponse.json({ error: "El correo ya está en uso por otro usuario" }, { status: 409 });

    // Crear Usuario + Chofer (Transacción)
    const passwordHash = await bcrypt.hash("1234", 10); 

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: nombre,
          email: email.toLowerCase(),
          hashedPassword: passwordHash,
          role: "Chofer", 
          empresaId: session.empresaId
        }
      });

      const newDriver = await tx.chofer.create({
        data: {
          rut,
          nombre,
          licencia: licencia.toUpperCase(),
          contacto,
          empresaId: session.empresaId,
          userId: newUser.id 
        }
      });

      return newDriver;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (err) {
    console.error("Error creando chofer+user:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}