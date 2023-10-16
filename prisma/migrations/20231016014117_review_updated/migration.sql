/*
  Warnings:

  - You are about to drop the column `bookingStatus` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `reviews` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "bookingStatus",
DROP COLUMN "paymentStatus";
