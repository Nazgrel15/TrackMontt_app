// src/app/api/integrations/sso/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";

const prisma = new PrismaClient();

// GET: Ver configuración actual
export async function GET(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const config = await prisma.empresa.findUnique({
      where: { id: session.empresaId },
      select: {
        ssoEnabled: true,
        ssoProvider: true,
        ssoClientId: true,
        ssoIssuerUrl: true,
        // NO devolvemos el clientSecret por seguridad
      }
    });

    return NextResponse.json(config);
  } catch (err) {
    return NextResponse.json({ error: "Error al cargar configuración SSO" }, { status: 500 });
  }
}

// PUT: Actualizar configuración
export async function PUT(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: true });
  if (error) return error;

  try {
    const body = await request.json();
    const { enabled, provider, clientId, clientSecret, issuerUrl } = body;

    // Objeto de actualización
    const updateData = {
      ssoEnabled: enabled,
      ssoProvider: provider,
      ssoClientId: clientId,
      ssoIssuerUrl: issuerUrl,
    };

    // Solo actualizamos el secreto si viene uno nuevo (para no borrar el existente)
    if (clientSecret && clientSecret.trim() !== "") {
      updateData.ssoClientSecret = clientSecret;
    }

    await prisma.empresa.update({
      where: { id: session.empresaId },
      data: updateData
    });

    // Auditoría
    await logAudit({
      session,
      accion: "update:sso",
      detalles: `Actualizó configuración SSO: ${provider} (${enabled ? 'Activado' : 'Desactivado'})`
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Error SSO Config:", err);
    return NextResponse.json({ error: "Error al guardar configuración SSO" }, { status: 500 });
  }
}