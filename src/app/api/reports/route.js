// src/app/api/reports/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getApiSession } from "@/lib/api-auth";

const prisma = new PrismaClient();

export async function GET(request) {
  const { session, error } = await getApiSession(request, { requireAdmin: false }); // Supervisor puede acceder
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type") || "Operacional";

  // Validar fechas
  const startDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endDate = to ? new Date(to) : new Date();
  // Ajustar fin del día para 'to'
  endDate.setHours(23, 59, 59, 999);

  try {
    // 1. Obtener servicios en el rango
    const servicios = await prisma.servicio.findMany({
      where: {
        empresaId: session.empresaId,
        fecha: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        bus: true,
        chofer: true,
        asistencias: true, // Para calcular ocupación
      },
      orderBy: { fecha: 'desc' },
    });

    // 2. Generar filas del reporte según el tipo
    // Nota: Como no tenemos distancias reales guardadas, simularemos Km para el ejemplo.
    // En producción, esto vendría de una tabla 'Ruta' o del cálculo GPS.
    
    const rows = servicios.map(s => {
      const ocupacion = s.asistencias.filter(a => a.status === "Presente").length;
      const capacidad = s.bus?.capacidad || 0;
      const porcentajeOcupacion = capacidad > 0 ? ((ocupacion / capacidad) * 100).toFixed(1) + "%" : "0%";
      
      // Simulación de datos métricos (KM y Costo)
      // Un valor aleatorio determinista basado en el ID para que no cambie al refrescar
      const seed = s.id.charCodeAt(0); 
      const kmEstimado = 15 + (seed % 20); // Entre 15 y 35 km
      const costoPorKm = 650; // CLP estandar
      const costoTotal = kmEstimado * costoPorKm;

      // Determinar "Puntualidad" basado en estado (Simplificado para MVP)
      const esPuntual = s.estado === "Finalizado" ? "Sí" : (s.estado === "Cancelado" ? "No" : "-");

      // Estructura base común
      const base = {
        Fecha: s.fecha.toISOString().split('T')[0],
        Turno: s.turno,
        Ruta: `${s.paradas[0] || '?'} -> ${s.paradas[s.paradas.length-1] || '?'}`,
        Bus: s.bus?.patente || "S/N",
        Chofer: s.chofer?.nombre || "S/N",
        Estado: s.estado,
      };

      // Columnas específicas según tipo
      if (type === "Costos") {
        return {
          ...base,
          "Km Recorridos": kmEstimado,
          "Costo Unitario": costoPorKm,
          "Costo Total (CLP)": costoTotal,
        };
      } else if (type === "Puntualidad") {
        return {
          ...base,
          "Hora Programada": "08:00", // Mock, faltaría campo hora en modelo
          "Hora Real": "08:05", // Mock, faltaría log de arribo
          "Puntual": esPuntual,
        };
      } else {
        // Operacional (Default)
        return {
          ...base,
          "Pax Presentes": ocupacion,
          "Capacidad Bus": capacidad,
          "Ocupación": porcentajeOcupacion,
        };
      }
    });

    // 3. Convertir a CSV
    if (rows.length === 0) {
        return new NextResponse("No hay datos para el rango seleccionado", { status: 404 });
    }

    const headers = Object.keys(rows[0]).join(",");
    const csvBody = rows.map(row => Object.values(row).map(v => `"${v}"`).join(",")).join("\n");
    const csv = `${headers}\n${csvBody}`;

    // 4. Retornar archivo
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="reporte_${type}_${from}_${to}.csv"`,
      },
    });

  } catch (err) {
    console.error("Error generando reporte:", err);
    return NextResponse.json({ error: "Error interno al generar reporte" }, { status: 500 });
  }
}