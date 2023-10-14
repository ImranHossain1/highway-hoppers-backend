-- CreateEnum
CREATE TYPE "BusSitNumber" AS ENUM ('A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4', 'E1', 'E2', 'E3', 'E4', 'F1', 'F2', 'F3', 'F4', 'G1', 'G2', 'G3', 'G4', 'H1', 'H2', 'H3', 'H4', 'I1', 'I2', 'I3', 'I4', 'J1', 'J2', 'J3', 'J4', 'K1', 'K2', 'K3', 'K4');

-- AlterTable
ALTER TABLE "buses" ALTER COLUMN "totalSit" SET DEFAULT 40;

-- CreateTable
CREATE TABLE "bus_sit" (
    "id" TEXT NOT NULL,
    "sitNumber" "BusSitNumber" NOT NULL,
    "busId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bus_sit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bus_sit" ADD CONSTRAINT "bus_sit_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
