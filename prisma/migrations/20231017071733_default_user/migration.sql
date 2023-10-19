-- AlterEnum
ALTER TYPE "Gender" ADD VALUE 'OPTIONAL';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "DOB" SET DEFAULT 'mm/dd/yyy',
ALTER COLUMN "address" SET DEFAULT 'not given',
ALTER COLUMN "contactNo" SET DEFAULT 'not given';
