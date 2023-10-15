-- AlterTable
ALTER TABLE "busSchedules" ALTER COLUMN "bookedSit" DROP NOT NULL,
ALTER COLUMN "bookedSit" SET DEFAULT 0;
