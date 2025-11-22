// src/app/api/auth/sso/callback/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { logAudit } from "@/lib/audit";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // Simulamos que recibimos un token ID del proveedor y el email del usuario
    // En un caso real, aquí validaríamos la firma del token JWT con la llave pública del Issuer
    const { email, externalToken } = await request.json();

    if (!email || !externalToken) {
      return NextResponse.json({ error: "Datos de autenticación incompletos" }, { status: 400 });
    }

    // 1. Buscar al usuario en nuestra BD
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      include: { empresa: true } // Traemos la empresa para ver la config SSO
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no registrado en TrackMontt" }, { status: 404 });
    }

    // 2. Verificar si la empresa tiene SSO habilitado
    if (!user.empresa.ssoEnabled) {
      return NextResponse.json({ error: "El inicio de sesión SSO no está habilitado para esta empresa" }, { status: 403 });
    }

    // 3. (Simulación) Validar el token externo
    // Aquí verificaríamos que externalToken venga firmado por user.empresa.ssoIssuerUrl
    // Para el MVP, asumimos que si el token es "VALID_MOCK_TOKEN", es válido.
    const isTokenValid = externalToken === "VALID_MOCK_TOKEN" || externalToken.length > 10; 
    
    if (!isTokenValid) {
      return NextResponse.json({ error: "Token SSO inválido o expirado" }, { status: 401 });
    }

    // 4. Generar sesión local (Mismo proceso que login normal)
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      empresaId: user.empresaId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });
    
    const response = NextResponse.json({ success: true, user: payload });
    
    response.cookies.set("tm_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
      sameSite: "Lax",
    });

    // 5. Auditoría
    // Creamos un objeto de sesión temporal porque aún no tiene la cookie
    await logAudit({
      session: { userId: user.id, empresaId: user.empresaId },
      accion: "login:sso",
      detalles: `Inicio de sesión vía SSO (${user.empresa.ssoProvider})`
    });

    return response;

  } catch (err) {
    console.error("Error SSO Callback:", err);
    return NextResponse.json({ error: "Error interno en autenticación SSO" }, { status: 500 });
  }
}