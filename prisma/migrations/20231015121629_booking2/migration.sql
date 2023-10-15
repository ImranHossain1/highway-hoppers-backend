/*
  Warnings:

  - Added the required column `bookingStatus` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentStatus` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "bookingStatus" "BookingStatus" NOT NULL,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL;

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "busScheduleId" TEXT NOT NULL,
    "bookingStatus" "BookingStatus" DEFAULT 'Pending',
    "paymentStatus" "PaymentStatus" DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bus_SitId" TEXT NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_busScheduleId_fkey" FOREIGN KEY ("busScheduleId") REFERENCES "busSchedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_bus_SitId_fkey" FOREIGN KEY ("bus_SitId") REFERENCES "bus_sit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
