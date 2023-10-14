/*
  Warnings:

  - The values [K1,K2,K3,K4] on the enum `BusSitNumber` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BusSitNumber_new" AS ENUM ('A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4', 'E1', 'E2', 'E3', 'E4', 'F1', 'F2', 'F3', 'F4', 'G1', 'G2', 'G3', 'G4', 'H1', 'H2', 'H3', 'H4', 'I1', 'I2', 'I3', 'I4', 'J1', 'J2', 'J3', 'J4');
ALTER TABLE "bus_sit" ALTER COLUMN "sitNumber" TYPE "BusSitNumber_new" USING ("sitNumber"::text::"BusSitNumber_new");
ALTER TYPE "BusSitNumber" RENAME TO "BusSitNumber_old";
ALTER TYPE "BusSitNumber_new" RENAME TO "BusSitNumber";
DROP TYPE "BusSitNumber_old";
COMMIT;
