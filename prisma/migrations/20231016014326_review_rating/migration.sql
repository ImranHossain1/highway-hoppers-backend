/*
  Warnings:

  - Added the required column `rating` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `review` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "review" TEXT NOT NULL;
