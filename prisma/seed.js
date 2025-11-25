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

  // 7. Crear un par de Paradas en Puerto Montt
  await prisma.parada.createMany({
    data: [
      { nombre: "Plaza de Armas", lat: -41.4717, lng: -72.9396, empresaId: empresa.id },
      { nombre: "Terminal de Buses", lat: -41.4685, lng: -72.9255, empresaId: empresa.id },
    ]
  });
  console.log("Paradas creadas.");
  
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