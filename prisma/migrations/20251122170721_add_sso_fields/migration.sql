-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "ssoClientId" TEXT,
ADD COLUMN     "ssoClientSecret" TEXT,
ADD COLUMN     "ssoEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ssoIssuerUrl" TEXT,
ADD COLUMN     "ssoProvider" TEXT;
