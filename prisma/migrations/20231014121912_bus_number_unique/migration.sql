/*
  Warnings:

  - A unique constraint covering the columns `[busNumber]` on the table `buses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "buses_busNumber_key" ON "buses"("busNumber");
