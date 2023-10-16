/*
  Warnings:

  - You are about to drop the column `totalRatings` on the `reviews` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "totalRatings" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "totalRatings";
