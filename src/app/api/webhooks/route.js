// src/app/api/webhooks/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";


// GET: Listar webhooks configurados
export async function GET(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const webhooks = await prisma.webhook.findMany({
      where: { empresaId: session.empresaId },
    });
    return NextResponse.json(webhooks);
  } catch (err) {
    return NextResponse.json({ error: "Error cargando webhooks" }, { status: 500 });
  }
}

// POST: Registrar nuevo webhook
export async function POST(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const { url, events } = await request.json();

    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const newWebhook = await prisma.webhook.create({
      data: {
        url,
        events, // Se guarda como array de strings (Prisma/Postgres lo soporta nativamente)
        empresaId: session.empresaId
      }
    });

    return NextResponse.json(newWebhook, { status: 201 });
  } catch (err) {
    console.error("Error creando webhook:", err);
    return NextResponse.json({ error: "Error al guardar webhook" }, { status: 500 });
  }
}

// DELETE: Eliminar webhook (opcional, vía query param ?id=...)
export async function DELETE(request) {
    const { session, error } = await getApiSession(request, { requireAdmin: true });
    if (error) return error;
  
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Falta ID" }, { status: 400 });

    try {
        await prisma.webhook.deleteMany({
            where: { id, empresaId: session.empresaId }
        });
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Error eliminando" }, { status: 500 });
    }
}