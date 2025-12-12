// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Empezando el script de seed...");

  // 1. Crear Empresa
  // Usamos 'upsert' o 'create' simple. Como la DB está vacía, create está bien.
  const empresa = await prisma.empresa.create({
    data: {
      nombre: "Transportes del Sur",
      toleranciaRetraso: 15
    },
  });
  console.log("Empresa creada.");

  // Contraseña "1234" hasheada
  const password = await bcrypt.hash("1234", 10);

  // 2. Crear Usuario Admin
  await prisma.user.create({
    data: {
      email: "kevin@trackmontt.cl",
      name: "Kevin Admin",
      role: "Administrador", // Debe coincidir con el Enum
      hashedPassword: password,
      empresaId: empresa.id,
    },
  });
  console.log("Usuario Admin creado.");

  // 3. Crear Usuario Supervisor (¡NUEVO!)
  await prisma.user.create({
    data: {
      email: "supervisor@trackmontt.cl",
      name: "Laura Supervisora",
      role: "Supervisor", // Debe coincidir con el Enum
      hashedPassword: password,
      empresaId: empresa.id,
    },
  });
  console.log("Usuario Supervisor creado.");

  // 4. Crear Usuario Chofer
  const userPedro = await prisma.user.create({
    data: {
      email: "chofer@trackmontt.cl",
      name: "Pedro Chofer",
      role: "Chofer", // Debe coincidir con el Enum
      hashedPassword: password,
      empresaId: empresa.id,
    },
  });
  console.log("Usuario Chofer creado.");

  // 5. Crear Perfil de Chofer ENLAZADO al Usuario
  await prisma.chofer.create({
    data: {
      rut: "12.345.678-9",
      nombre: "Pedro Muñoz",
      licencia: "A3",
      contacto: "+56912345678",
      empresaId: empresa.id,
      userId: userPedro.id, // Enlazamos IDs
    },
  });
  console.log("Perfil Chofer creado y enlazado.");

  // 6. Crear un Bus
  const bus = await prisma.bus.create({
    data: {
      patente: "KLRR-99",
      capacidad: 40,
      proveedor: "Transportes del Sur",
      empresaId: empresa.id,
    }
  });
  console.log("Bus creado.");

  // 7. Crear Paradas en Puerto Montt
  await prisma.parada.createMany({
    data: [
      // --- DESTINOS (Plantas y Centros de Cultivo) ---
      {
        nombre: "Planta Salmonera - Chinquihue Km 13",
        lat: -41.4855,
        lng: -72.9842,
        empresaId: empresa.id
      },
      {
        nombre: "Centro de Cultivo - Sector Tenglo",
        lat: -41.4920,
        lng: -72.9650,
        empresaId: empresa.id
      },

      // --- PARADEROS (Recogida de Trabajadores) ---
      {
        nombre: "Hospital Base Puerto Montt",
        lat: -41.4534,
        lng: -72.9265,
        empresaId: empresa.id
      },
      {
        nombre: "Mall Paseo Costanera (Centro)",
        lat: -41.4718,
        lng: -72.9365,
        empresaId: empresa.id
      },
      {
        nombre: "Mercado Angelmó",
        lat: -41.4785,
        lng: -72.9542,
        empresaId: empresa.id
      },
      {
        nombre: "Valle Volcanes - Supermercado",
        lat: -41.4552,
        lng: -72.9125,
        empresaId: empresa.id
      },
      {
        nombre: "Sector Mirasol - Padre Harter",
        lat: -41.4650,
        lng: -72.9680,
        empresaId: empresa.id
      },
      {
        nombre: "Población Pichi Pelluco",
        lat: -41.4750,
        lng: -72.9200,
        empresaId: empresa.id
      },
      {
        nombre: "Universidad San Sebastián (Pelluco)",
        lat: -41.4835,
        lng: -72.9030,
        empresaId: empresa.id
      },
      {
        nombre: "Rotonda Presidente Ibáñez",
        lat: -41.4580,
        lng: -72.9350,
        empresaId: empresa.id
      },

      // --- PARADAS ORIGINALES ---
      {
        nombre: "Plaza de Armas",
        lat: -41.4717,
        lng: -72.9396,
        empresaId: empresa.id
      },
      {
        nombre: "Terminal de Buses",
        lat: -41.4685,
        lng: -72.9255,
        empresaId: empresa.id
      },
    ]
  });
  console.log("Paradas creadas (12 en total).");

  console.log("Seed completado correctamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });