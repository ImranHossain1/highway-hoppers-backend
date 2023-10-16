/*
  Warnings:

  - Made the column `salary` on table `drivers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rating` on table `drivers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalReviewer` on table `drivers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "drivers" ALTER COLUMN "salary" SET NOT NULL,
ALTER COLUMN "rating" SET NOT NULL,
ALTER COLUMN "totalReviewer" SET NOT NULL;
