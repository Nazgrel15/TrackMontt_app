// src/app/api/incidents/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/api-auth";
import { saveIncidentPhoto } from "@/lib/fileUpload";

export async function POST(request) {
    const { session, error } = await getApiSession(request);
    if (error) return error;

    try {
        // Obtener datos del formulario
        const formData = await request.formData();
        const tipo = formData.get('tipo');
        const nota = formData.get('nota') || '';
        const servicioId = formData.get('servicioId');
        const foto = formData.get('foto');

        // Validar campos requeridos
        if (!tipo) {
            return NextResponse.json(
                { error: "El tipo de incidente es requerido" },
                { status: 400 }
            );
        }

        // Obtener información del chofer desde la sesión
        const chofer = await prisma.chofer.findUnique({
            where: { userId: session.userId },
        });

        if (!chofer) {
            return NextResponse.json(
                { error: "Usuario no es un chofer válido" },
                { status: 403 }
            );
        }

        // Procesar foto si existe
        let urlFoto = null;
        if (foto && foto.size > 0) {
            try {
                urlFoto = await saveIncidentPhoto(foto);
            } catch (uploadError) {
                console.error("Error al guardar foto:", uploadError);
                return NextResponse.json(
                    { error: uploadError.message },
                    { status: 400 }
                );
            }
        }

        // Crear el incidente en la base de datos (servicioId opcional)
        const incidenteData = {
            tipo,
            nota,
            urlFoto,
            empresaId: session.empresaId,
            choferId: chofer.id,
            // SIEMPRE incluir servicioId, aunque sea null
            servicioId: (servicioId && servicioId !== 'no-service') ? servicioId : null,
        };

        const incidente = await prisma.incidente.create({
            data: incidenteData,
            include: {
                chofer: true,
                servicio: {
                    include: { bus: true }
                }
            }
        });

        // Crear alerta automática para notificar al equipo
        const alertaData = {
            tipo: `Incidente: ${tipo}`,
            severidad: tipo === 'Accidente' ? 'Alta' : 'Media',
            mensaje: `El chofer ${chofer.nombre} reportó un incidente de tipo "${tipo}". ${nota ? `Nota: ${nota}` : ''}`,
            empresaId: session.empresaId,
        };

        // Solo agregar servicioId a la alerta si existe
        if (servicioId && servicioId !== 'no-service') {
            alertaData.servicioId = servicioId;
        }

        await prisma.alerta.create({
            data: alertaData
        });

        return NextResponse.json({
            success: true,
            incidente,
            message: "Incidente reportado exitosamente"
        }, { status: 201 });

    } catch (err) {
        console.error("Error al crear incidente:", err);
        return NextResponse.json(
            { error: "Error interno al procesar el incidente" },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    const { session, error } = await getApiSession(request);
    if (error) return error;

    try {
        const incidentes = await prisma.incidente.findMany({
            where: {
                empresaId: session.empresaId,
            },
            include: {
                chofer: true,
                servicio: {
                    include: { bus: true }
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        return NextResponse.json(incidentes);
    } catch (err) {
        console.error("Error fetching incidents:", err);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
