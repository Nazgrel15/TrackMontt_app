// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Empezando el script de seed...");

  // 1. Crear la empresa "Demo"
  const empresaDemo = await prisma.empresa.create({
    data: {
      nombre: "Empresa Demo",
      // (Aquí puedes agregar los parámetros del Ticket B13)
      toleranciaRetraso: 15,
      retencionDatosDias: 90,
      factorCO2: 2.67,
    },
  });
  console.log(`Creada empresa: ${empresaDemo.nombre} (ID: ${empresaDemo.id})`);

  // 2. Hashear la contraseña (¡NUNCA guardar "1234" directo!)
  const hashedPassword = await bcrypt.hash("1234", 10);

  // 3. Crear el usuario Administrador de prueba
  const admin = await prisma.user.create({
    data: {
      email: "kevin@trackmontt.cl",
      name: "Kevin Admin",
      role: "Administrador",
      hashedPassword: hashedPassword,
      empresaId: empresaDemo.id, // Conectarlo a la empresa demo
    },
  });
  
  // (Opcional) Crear un usuario Supervisor y Chofer para pruebas
  const superv = await prisma.user.create({
    data: {
      email: "supervisor@trackmontt.cl",
      name: "Laura Supervisora",
      role: "Supervisor",
      hashedPassword: hashedPassword,
      empresaId: empresaDemo.id,
    },
  });

  const chofer = await prisma.user.create({
    data: {
      email: "chofer@trackmontt.cl",
      name: "Pedro Chofer",
      role: "Chofer",
      hashedPassword: hashedPassword,
      empresaId: empresaDemo.id,
    },
  });

  console.log(`Creados 3 usuarios (admin, supervisor, chofer) con contraseña: 1234`);
  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });