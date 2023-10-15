/*
  Warnings:

  - You are about to drop the column `bookingStatus` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `reviews` table. All the data in the column will be lost.
  - Added the required column `bus_sitId` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'Pending';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "bus_sitId" TEXT NOT NULL,
ALTER COLUMN "bookingStatus" DROP NOT NULL,
ALTER COLUMN "paymentStatus" SET DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "busSchedules" ADD COLUMN     "PendingSit" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "bookingStatus",
DROP COLUMN "paymentStatus";

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_bus_sitId_fkey" FOREIGN KEY ("bus_sitId") REFERENCES "bus_sit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
