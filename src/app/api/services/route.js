// src/app/api/services/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

export async function GET(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: false });
  if (error) return error;

  try {
    // 1. Filtro base: Siempre por la empresa del usuario (Tenant)
    const whereClause = { 
      empresaId: session.empresaId 
    };

    // 2. LOGICA DE PRIVACIDAD: Si es Chofer, filtramos por SU perfil
    if (session.role === 'Chofer') {
      // Buscamos el perfil de Chofer asociado a este usuario (userId)
      const choferPerfil = await prisma.chofer.findFirst({
        where: { 
          userId: session.userId,
          empresaId: session.empresaId 
        }
      });

      if (choferPerfil) {
        // Si encontramos el perfil, filtramos los servicios por SU id de chofer
        whereClause.choferId = choferPerfil.id;
      } else {
        // Si es rol Chofer pero no tiene perfil creado, no debe ver nada
        return NextResponse.json([]); 
      }
    }

    // 3. Consulta a la BD con el filtro dinámico
    const services = await prisma.servicio.findMany({
      where: whereClause,
      include: {
        bus: true,
        chofer: true,
      },
      orderBy: { fecha: 'desc' }
    });

    return NextResponse.json(services);

  } catch (err) {
    console.error("Error API Services:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}