import { NextResponse } from "next/server";
import { authenticator } from "otplib";
import qrcode from "qrcode";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request) {
    try {
        // 1. Verificar autenticación
        const cookieStore = await cookies();
        const token = cookieStore.get("tm_auth")?.value;

        if (!token) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId;

        // 2. Generar secreto
        const secret = authenticator.generateSecret();

        // 3. Generar URL otpauth
        const userEmail = payload.email;
        const serviceName = "TrackMontt";
        const otpauth = authenticator.keyuri(userEmail, serviceName, secret);

        // 4. Generar QR Code
        const qrImageUrl = await qrcode.toDataURL(otpauth);

        // 5. Guardar secreto temporalmente (o devolverlo para que el cliente lo verifique primero)
        // NOTA: Para mayor seguridad, deberíamos guardar este secreto en la BD pero marcado como "pendiente"
        // o simplemente actualizar el usuario con el secreto pero mantener mfaEnabled = false hasta que verifique.

        await prisma.user.update({
            where: { id: userId },
            data: { mfaSecret: secret, mfaEnabled: false } // Secreto guardado, pero MFA aún inactivo
        });

        return NextResponse.json({ secret, qrImageUrl });

    } catch (error) {
        console.error("Error generando MFA:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
