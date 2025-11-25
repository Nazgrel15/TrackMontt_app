// src/app/api/workers/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";


// GET: Listar trabajadores de la empresa
export async function GET(request) {
  const { session, error } = await getApiSession(request);
  if (error) return error;

  try {
    const workers = await prisma.trabajador.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(workers);
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST: Crear trabajador(es)
// POST: Crear trabajador(es)
export async function POST(request) {
  // 1. Cambiamos requireAdmin a false para permitir Supervisores
  const { session, error } = await getApiSession(request, { requireAdmin: false });
  if (error) return error;

  // 2. Bloqueamos explícitamente a los Choferes (Seguridad)
  if (session.role === "Chofer") {
    return NextResponse.json({ error: "No tienes permisos para realizar esta acción" }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    // ... (El resto de la lógica de Carga Masiva y Creación Individual sigue IGUAL) ...
    
    // (Solo asegúrate de mantener el código que ya tenías aquí abajo)
    if (Array.isArray(body)) {
        // ... lógica array ...
        const dataWithCompany = body.map(w => ({
            rut: w.rut,
            nombre: w.nombre,
            area: w.area,
            empresaId: session.empresaId
        }));
        const result = await prisma.trabajador.createMany({
            data: dataWithCompany,
            skipDuplicates: true,
        });
        return NextResponse.json({ success: true, count: result.count, message: `Se importaron ${result.count} trabajadores.` }, { status: 201 });
    }

    const { rut, nombre, area } = body;
    if (!rut || !nombre) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const existing = await prisma.trabajador.findFirst({
      where: { rut, empresaId: session.empresaId }
    });
    if (existing) {
      return NextResponse.json({ error: "El RUT ya está registrado en esta empresa." }, { status: 409 });
    }

    const newWorker = await prisma.trabajador.create({
      data: {
        rut,
        nombre,
        area: area || "General",
        empresaId: session.empresaId
      }
    });

    return NextResponse.json(newWorker, { status: 201 });

  } catch (err) {
    console.error("Error POST workers:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}