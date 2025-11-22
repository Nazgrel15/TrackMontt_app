// src/app/api/alerts/check/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

export async function POST(request) {
  const { session, error } = await getApiSession(request);
  if (error) return error;

  try {
    // 1. Obtener configuración de tolerancia de la empresa
    const empresa = await prisma.empresa.findUnique({
      where: { id: session.empresaId }
    });
    const toleranciaMinutos = empresa?.toleranciaRetraso || 15;

    // 2. Buscar servicios ACTIVO (EnCurso)
    const serviciosActivos = await prisma.servicio.findMany({
      where: {
        empresaId: session.empresaId,
        estado: "EnCurso"
      },
      include: { bus: true }
    });

    const nuevasAlertas = [];
    const ahora = new Date();

    // 3. Evaluar cada servicio
    for (const servicio of serviciosActivos) {
      const inicioProgramado = new Date(servicio.fecha);
      const tiempoTranscurridoMs = ahora - inicioProgramado;
      const tiempoTranscurridoMin = Math.floor(tiempoTranscurridoMs / 1000 / 60);

      // REGLA 1: RETRASO
      // Si el servicio lleva activo más tiempo que "Duración Estimada (ej. 60 min) + Tolerancia"
      // Para este MVP, asumimos que una ruta promedio dura 45 min.
      const duracionPromedio = 45; 
      
      if (tiempoTranscurridoMin > (duracionPromedio + toleranciaMinutos)) {
        
        // Verificar si ya existe una alerta reciente para no duplicar
        const alertaExistente = await prisma.alerta.findFirst({
          where: {
            servicioId: servicio.id,
            tipo: "retraso",
            estado: "Pendiente"
          }
        });

        if (!alertaExistente) {
          const nueva = await prisma.alerta.create({
            data: {
              tipo: "retraso",
              severidad: "amarillo",
              mensaje: `Retraso detectado: El servicio lleva ${tiempoTranscurridoMin} min activo (Umbral: ${duracionPromedio + toleranciaMinutos} min). Bus: ${servicio.bus?.patente}`,
              estado: "Pendiente",
              empresaId: session.empresaId,
              servicioId: servicio.id
            }
          });
          nuevasAlertas.push(nueva);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      analizados: serviciosActivos.length, 
      generadas: nuevasAlertas.length 
    });

  } catch (err) {
    console.error("Error motor de alertas:", err);
    return NextResponse.json({ error: "Error ejecutando chequeo" }, { status: 500 });
  }
}