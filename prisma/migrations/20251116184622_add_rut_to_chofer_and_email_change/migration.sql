/*
  Warnings:

  - A unique constraint covering the columns `[rut,empresaId]` on the table `Chofer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,empresaId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rut` to the `Chofer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Chofer" ADD COLUMN     "rut" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Chofer_rut_empresaId_key" ON "Chofer"("rut", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_empresaId_key" ON "User"("email", "empresaId");
