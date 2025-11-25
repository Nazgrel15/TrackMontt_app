// src/app/api/integrations/hr/export/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";


export async function GET(request) {
  const { session, error } = await getApiSession(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const area = searchParams.get("area"); // ✨ Nuevo parámetro

  const startDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endDate = to ? new Date(to) : new Date();
  endDate.setHours(23, 59, 59, 999);

  try {
    // Construir filtro dinámico
    const whereClause = {
      empresaId: session.empresaId,
      servicio: {
        fecha: { gte: startDate, lte: endDate }
      }
    };

    // ✨ Si hay área seleccionada, filtramos por la relación trabajador -> area
    if (area && area !== "Todas") {
      whereClause.trabajador = {
        area: area
      };
    }

    const records = await prisma.asistencia.findMany({
      where: whereClause,
      include: {
        trabajador: true,
        servicio: true,
      },
      orderBy: [
        { trabajador: { nombre: 'asc' } },
        { servicio: { fecha: 'asc' } }
      ]
    });

    if (records.length === 0) {
       return new NextResponse("No hay registros de asistencia para los filtros seleccionados.", { status: 404 });
    }

    // Formatear CSV
    const rows = records.map(r => ({
      "RUT Trabajador": r.trabajador?.rut || "S/N",
      "Nombre Completo": r.trabajador?.nombre || "S/N",
      "Centro/Area": r.trabajador?.area || "-",
      "Fecha Servicio": r.servicio?.fecha.toISOString().split('T')[0],
      "Turno": r.servicio?.turno || "-",
      "Estado Asistencia": r.status,
      "Hora Check-In": r.checkIn ? new Date(r.checkIn).toLocaleTimeString("es-CL") : ""
    }));

    const headers = Object.keys(rows[0]).join(",");
    const csvBody = rows.map(row => Object.values(row).map(v => `"${v}"`).join(",")).join("\n");
    const csv = `\uFEFF${headers}\n${csvBody}`;

    // Incluir el área en el nombre del archivo si aplica
    const areaSuffix = area && area !== "Todas" ? `_${area.replace(/\s+/g, '')}` : "";

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="nomina_asistencia_${from}_${to}${areaSuffix}.csv"`,
      },
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}