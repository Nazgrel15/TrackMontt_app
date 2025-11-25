import { NextResponse } from "next/server";
import { authenticator } from "otplib";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
    try {
        const { token: mfaToken } = await request.json();

        // 1. Verificar autenticación
        const cookieStore = await cookies();
        const token = cookieStore.get("tm_auth")?.value;

        if (!token) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId;

        // 2. Obtener usuario y su secreto
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.mfaSecret) {
            return NextResponse.json({ error: "Configuración MFA no iniciada" }, { status: 400 });
        }

        // 3. Verificar token
        const isValid = authenticator.verify({ token: mfaToken, secret: user.mfaSecret });

        if (!isValid) {
            return NextResponse.json({ error: "Código inválido" }, { status: 400 });
        }

        // 4. Activar MFA
        await prisma.user.update({
            where: { id: userId },
            data: { mfaEnabled: true }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error verificando MFA:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
