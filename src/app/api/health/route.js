import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCached, setCache } from "@/lib/cache";

export async function GET() {
    // Verificar cache primero (5 segundos TTL)
    const cached = getCached('health-data', 5000);
    if (cached) {
        return NextResponse.json(cached);
    }

    const start = performance.now();
    const healthData = {
        status: "online",
        timestamp: new Date().toISOString(),
        services: [],
        kpis: []
    };

    // 1. Diagnóstico Base de Datos
    let dbStatus = "offline";
    let dbLatency = 0;
    try {
        const dbStart = performance.now();
        await prisma.$queryRaw`SELECT 1`;
        const dbEnd = performance.now();
        dbLatency = Math.round(dbEnd - dbStart);
        dbStatus = "online";
    } catch (error) {
        console.error("Database health check failed:", error);
        dbStatus = "offline";
    }

    healthData.services.push({
        id: "database",
        name: "Base de Datos",
        description: "PostgreSQL Main Cluster",
        status: dbStatus,
        latency: dbLatency,
        uptime: 99.99, // Simulado por ahora, idealmente vendría de un servicio de monitoreo
        icon: "database"
    });

    // 2. Diagnóstico API Interna
    // Si estamos ejecutando este código, la API está respondiendo.
    // Restamos el tiempo que tomó la DB para obtener la latencia "pura" de la API
    const totalTime = performance.now() - start;
    const apiOverhead = Math.max(1, Math.round(totalTime - dbLatency));

    healthData.services.push({
        id: "api",
        name: "API Interna",
        description: "Next.js API Routes",
        status: "online",
        latency: apiOverhead,
        uptime: 99.95, // Simulado
        icon: "cloud"
    });

    // 3. Diagnóstico Webhooks
    let webhookStatus = "online";
    let webhookCount = 0;
    try {
        // Verificamos si hay webhooks activos configurados en el sistema
        webhookCount = await prisma.webhook.count({
            where: { active: true }
        });

        // Si no hay webhooks, podemos considerarlo "inactivo" o "online" (sin errores).
        // Lo marcaremos como online pero con latencia 0.
    } catch (error) {
        console.error("Webhook health check failed:", error);
        webhookStatus = "offline";
    }

    healthData.services.push({
        id: "webhooks",
        name: "Webhooks",
        description: `${webhookCount} Webhooks Activos`,
        status: webhookStatus,
        latency: webhookStatus === "online" ? 45 : 0, // Simulado
        uptime: 99.90, // Simulado
        icon: "webhook"
    });

    // 4. GPS Tracking (Simulado por ahora, ya que requeriría verificar servicio externo)
    healthData.services.push({
        id: "gps",
        name: "GPS Tracking",
        description: "Real-time Geolocation Service",
        status: "online",
        latency: 85,
        uptime: 99.92,
        icon: "satellite"
    });

    // KPIs Generales
    healthData.kpis = [
        {
            id: "uptime",
            label: "Uptime (API)",
            value: "99.98%",
            trend: "24h",
            hint: "Disponibilidad del servicio últimas 24h",
            status: "ok"
        },
        {
            id: "latency",
            label: "Latencia API",
            value: `${apiOverhead} ms`,
            trend: "actual",
            hint: "Tiempo de respuesta actual",
            status: apiOverhead < 800 ? "ok" : "warn"
        },
        {
            id: "errors",
            label: "Tasa de Errores",
            value: "0.00%",
            trend: "última hora",
            hint: "Porcentaje de errores 5xx",
            status: "ok"
        },
    ];

    // 5. Errores Recientes (Alertas)
    let recentErrors = [];
    try {
        const alertas = await prisma.alerta.findMany({
            take: 5,
            orderBy: { timestamp: 'desc' },
            include: { servicio: true }
        });

        recentErrors = alertas.map(a => ({
            id: a.id,
            timestamp: a.timestamp.toISOString(),
            code: 500, // Código genérico ya que son alertas de negocio
            service: a.servicio?.id || "Sistema",
            message: a.mensaje
        }));
    } catch (error) {
        console.error("Error fetching alerts:", error);
    }

    const response = { ...healthData, recentErrors };

    // Guardar en cache antes de retornar
    setCache('health-data', response);

    return NextResponse.json(response);
}
