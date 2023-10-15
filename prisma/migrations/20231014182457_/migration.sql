-- AlterTable
ALTER TABLE "busSchedules" ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Upcoming';
