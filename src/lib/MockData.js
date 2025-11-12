// src/lib/mockData.js

// ... (agrega esto al final del archivo)

export const mockAlerts = [
  {
    id: "A-001",
    timestamp: "2025-11-11T10:30:00",
    type: "retraso", // 'retraso', 'desvio', 'parada_omitida'
    severity: "rojo", // 'rojo', 'amarillo', 'verde'
    status: "Pendiente", // 'Pendiente', 'En proceso', 'Cerrada'
    message: "Bus PPU-1234 (Ruta 5) reporta 15 min de retraso. ETA actual: 10:45",
  },
  {
    id: "A-002",
    timestamp: "2025-11-11T10:15:00",
    type: "desvio",
    severity: "amarillo",
    status: "En proceso",
    message: "Bus PPU-5678 (Ruta 2) detectado fuera de geocerca en Alerce.",
  },
  {
    id: "A-003",
    timestamp: "2025-11-11T09:45:00",
    type: "parada_omitida",
    severity: "rojo",
    status: "Cerrada",
    message: "Bus PPU-1234 (Ruta 5) no marcó asistencia en Parada 'Cruce Las Lomas'.",
  },
  {
    id: "A-004",
    timestamp: "2025-11-11T11:00:00",
    type: "retraso",
    severity: "amarillo",
    status: "Pendiente",
    message: "Bus PPU-9012 (Ruta 1) reporta 5 min de retraso. ETA actual: 11:05",
  },
];

export const alertTypes = {
  retraso: "Retraso",
  desvio: "Desvío de Ruta",
  parada_omitida: "Parada Omitida",
};