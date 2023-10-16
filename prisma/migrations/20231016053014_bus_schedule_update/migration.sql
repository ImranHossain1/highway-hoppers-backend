/*
  Warnings:

  - The `status` column on the `busSchedules` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Bus_Schedule_Status" AS ENUM ('Upcoming', 'Ongoing', 'Arrived');

-- DropForeignKey
ALTER TABLE "busSchedules" DROP CONSTRAINT "busSchedules_driverId_fkey";

-- AlterTable
ALTER TABLE "busSchedules" DROP COLUMN "status",
ADD COLUMN     "status" "Bus_Schedule_Status" DEFAULT 'Upcoming';

-- DropEnum
DROP TYPE "Bus_Schedul_Status";

-- AddForeignKey
ALTER TABLE "busSchedules" ADD CONSTRAINT "busSchedules_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
