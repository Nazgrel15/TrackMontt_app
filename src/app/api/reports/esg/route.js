// src/app/api/reports/esg/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";


export async function GET(request) {
  const { session, error } = await getApiSession(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Rango de fechas
  const startDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endDate = to ? new Date(to) : new Date();
  endDate.setHours(23, 59, 59, 999);

  try {
    // 1. Obtener configuración de la empresa (Factor CO2)
    const empresa = await prisma.empresa.findUnique({
      where: { id: session.empresaId },
      select: { factorCO2: true }
    });
    // Si no está configurado, usamos valor por defecto (2.67 kg CO2/Litro Diesel)
    const factorEmision = empresa?.factorCO2 || 2.67;

    // 2. Obtener servicios FINALIZADOS (solo estos generan huella real)
    const servicios = await prisma.servicio.findMany({
      where: {
        empresaId: session.empresaId,
        fecha: { gte: startDate, lte: endDate },
        estado: "Finalizado" 
      },
      include: { bus: true, chofer: true },
      orderBy: { fecha: 'desc' }
    });

    if (servicios.length === 0) {
        return new NextResponse("No hay servicios finalizados en el rango seleccionado para calcular huella.", { status: 404 });
    }

    // 3. Calcular métricas ESG
    const rows = servicios.map(s => {
      // Simulación de Km (igual que en reporte operacional, ya que no hay GPS histórico real aún)
      // En producción, esto sería: s.kmRecorridos
      const seed = s.id.charCodeAt(0);
      const km = 15 + (seed % 20); 
      
      // Supuesto: Rendimiento promedio de un bus estándar = 3 km/litro
      const rendimientoBus = 3.0; 
      const litrosConsumidos = km / rendimientoBus;
      
      // Fórmula: Litros * Factor Emisión
      const huella = litrosConsumidos * factorEmision;

      return {
        Fecha: s.fecha.toISOString().split('T')[0],
        Turno: s.turno,
        Patente: s.bus?.patente || "S/N",
        Chofer: s.chofer?.nombre || "S/N",
        "Km Recorridos": km.toFixed(2),
        "Rendimiento (km/L)": rendimientoBus,
        "Consumo Estimado (L)": litrosConsumidos.toFixed(2),
        "Factor Emisión (kg/L)": factorEmision,
        "Huella CO2 (kg)": huella.toFixed(2)
      };
    });

    // 4. Generar CSV con BOM (\uFEFF) para Excel
    const headers = Object.keys(rows[0]).join(",");
    const csvBody = rows.map(row => Object.values(row).map(v => `"${v}"`).join(",")).join("\n");
    const csv = `\uFEFF${headers}\n${csvBody}`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="reporte_esg_${from}_${to}.csv"`,
      },
    });

  } catch (err) {
    console.error("Error reporte ESG:", err);
    return NextResponse.json({ error: "Error interno al generar reporte ESG" }, { status: 500 });
  }
}