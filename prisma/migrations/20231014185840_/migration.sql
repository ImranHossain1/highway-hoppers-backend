/*
  Warnings:

  - You are about to drop the column `weekDays` on the `busSchedules` table. All the data in the column will be lost.
  - Added the required column `dayOfWeek` to the `busSchedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "busSchedules" DROP COLUMN "weekDays",
ADD COLUMN     "dayOfWeek" "WeekDays" NOT NULL;
