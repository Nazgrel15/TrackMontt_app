-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "ventanaFin" TEXT NOT NULL DEFAULT '23:00',
ADD COLUMN     "ventanaInicio" TEXT NOT NULL DEFAULT '06:00';
