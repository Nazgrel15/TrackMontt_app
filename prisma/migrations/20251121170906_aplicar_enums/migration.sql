/*
  Warnings:

  - The `estado` column on the `Servicio` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId]` on the table `Chofer` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `status` on the `Asistencia` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('Administrador', 'Supervisor', 'Chofer');

-- CreateEnum
CREATE TYPE "EstadoServicio" AS ENUM ('Programado', 'EnCurso', 'Finalizado', 'Cancelado');

-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('Presente', 'Ausente', 'Justificado');

-- CreateEnum
CREATE TYPE "Severidad" AS ENUM ('Baja', 'Media', 'Alta', 'Critica');

-- DropForeignKey
ALTER TABLE "Alerta" DROP CONSTRAINT "Alerta_servicioId_fkey";

-- DropForeignKey
ALTER TABLE "Asistencia" DROP CONSTRAINT "Asistencia_servicioId_fkey";

-- DropForeignKey
ALTER TABLE "Incidente" DROP CONSTRAINT "Incidente_servicioId_fkey";

-- DropForeignKey
ALTER TABLE "LogPosicion" DROP CONSTRAINT "LogPosicion_servicioId_fkey";

-- AlterTable
ALTER TABLE "Asistencia" DROP COLUMN "status",
ADD COLUMN     "status" "EstadoAsistencia" NOT NULL;

-- AlterTable
ALTER TABLE "Chofer" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Servicio" DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoServicio" NOT NULL DEFAULT 'Programado';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Rol" NOT NULL DEFAULT 'Supervisor';

-- CreateIndex
CREATE UNIQUE INDEX "Chofer_userId_key" ON "Chofer"("userId");

-- CreateIndex
CREATE INDEX "Servicio_fecha_estado_idx" ON "Servicio"("fecha", "estado");

-- AddForeignKey
ALTER TABLE "Chofer" ADD CONSTRAINT "Chofer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogPosicion" ADD CONSTRAINT "LogPosicion_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidente" ADD CONSTRAINT "Incidente_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
