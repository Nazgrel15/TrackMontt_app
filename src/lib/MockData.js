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


export const mockAsistencia = [
  { id: 'AS-001', serviceId: 'S-000', workerName: 'Ana González', workerRut: '11.111.111-1', status: 'Presente', checkIn: '06:58' },
  { id: 'AS-002', serviceId: 'S-000', workerName: 'Bruno Díaz', workerRut: '22.222.222-2', status: 'Ausente', checkIn: null },
  { id: 'AS-003', serviceId: 'S-001', workerName: 'Carlos Vera', workerRut: '33.333.333-3', status: 'Presente', checkIn: '07:05' },
  { id: 'AS-004', serviceId: 'S-001', workerName: 'David Mora', workerRut: '44.444.444-4', status: 'Justificado', checkIn: null },
];

export const attendanceStatus = ['Presente', 'Ausente', 'Justificado'];


export const mockAuditoria = [
  { id: 'L-001', timestamp: '2025-11-12T14:30:00Z', user: 'kevin@trackmontt.cl', action: 'login:success', ip: '200.55.120.10', details: 'Inicio de sesión exitoso' },
  { id: 'L-002', timestamp: '2025-11-12T14:15:00Z', user: 'laura@trackmontt.cl', action: 'update:fleet', ip: '180.20.10.5', details: 'Actualizó bus B-002' },
  { id: 'L-003', timestamp: '2025-11-12T14:10:00Z', user: 'laura@trackmontt.cl', action: 'create:service', ip: '180.20.10.5', details: 'Creó servicio S-004' },
  { id: 'L-004', timestamp: '2025-11-12T14:05:00Z', user: 'pedro@trackmontt.cl', action: 'login:success', ip: '190.100.1.30', details: 'Inicio de sesión exitoso' },
  { id: 'L-005', timestamp: '2025-11-12T13:00:00Z', user: 'kevin@trackmontt.cl', action: 'export:report', ip: '200.55.120.10', details: 'Exportó reporte de puntualidad' },
];

export const auditActions = {
  'login:success': 'Inicio de Sesión',
  'update:fleet': 'Actualizar Flota',
  'create:service': 'Crear Servicio',
  'export:report': 'Exportar Reporte',
};



export const mockSaludKPIs = [
  { 
    id: "uptime",    
    label: "Uptime (API)",           
    value: "99.98%", 
    trend: "24h",  
    hint: "Disponibilidad del servicio últimas 24h",
    status: "ok" // 'ok', 'warn', 'error'
  },
  { 
    id: "latency",   
    label: "Latencia API (p95)",   
    value: "120 ms", 
    trend: "< 700ms", 
    hint: "Percentil 95 de respuesta del API",
    status: "ok"
  },
  { 
    id: "errors",   
    label: "Tasa de Errores (API)",      
    value: "0.02%", 
    trend: "última hora", 
    hint: "Porcentaje de errores 5xx",
    status: "ok"
  },
];

export const mockErroresRecientes = [
  { id: 'E-001', timestamp: '2025-11-12T14:32:00Z', code: 500, service: 'api/login', message: 'Database connection timeout' },
  { id: 'E-002', timestamp: '2025-11-12T14:28:00Z', code: 404, service: 'api/fleet/B-999', message: 'Bus not found' },
  { id: 'E-003', timestamp: '2025-11-12T14:25:00Z', code: 502, service: 'api/ws-gateway', message: 'Bad Gateway' },
];