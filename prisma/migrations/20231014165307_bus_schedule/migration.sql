/*
  Warnings:

  - You are about to drop the column `date` on the `busSchedules` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `busSchedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `busSchedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "busSchedules" DROP COLUMN "date",
ADD COLUMN     "endDate" TEXT NOT NULL,
ADD COLUMN     "startDate" TEXT NOT NULL;
