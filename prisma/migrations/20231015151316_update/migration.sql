/*
  Warnings:

  - A unique constraint covering the columns `[busScheduleId]` on the table `singleTripIncomes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "singleTripIncomes_busScheduleId_key" ON "singleTripIncomes"("busScheduleId");
