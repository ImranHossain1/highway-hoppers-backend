-- CreateEnum
CREATE TYPE "BusType" AS ENUM ('AC', 'Non_AC');

-- CreateEnum
CREATE TYPE "WeekDays" AS ENUM ('SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY');

-- CreateEnum
CREATE TYPE "Bus_Schedul_Status" AS ENUM ('Upcoming', 'Ongoing', 'Arrived');

-- CreateTable
CREATE TABLE "buses" (
    "id" TEXT NOT NULL,
    "busType" "BusType" NOT NULL,
    "busNumber" TEXT NOT NULL,
    "totalSit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "busSchedules" (
    "id" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "startingPoint" TEXT NOT NULL,
    "endPoint" TEXT NOT NULL,
    "weekDays" "WeekDays" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bookedSit" INTEGER NOT NULL,
    "busFare" DOUBLE PRECISION NOT NULL,
    "status" "Bus_Schedul_Status" NOT NULL,
    "busId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "busSchedules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "busSchedules" ADD CONSTRAINT "busSchedules_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "busSchedules" ADD CONSTRAINT "busSchedules_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
