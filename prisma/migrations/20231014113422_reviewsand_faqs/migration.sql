-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "singleTripIncomes" (
    "id" TEXT NOT NULL,
    "busScheduleId" TEXT NOT NULL,
    "earnings" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "singleTripIncomes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "singleTripIncomes" ADD CONSTRAINT "singleTripIncomes_busScheduleId_fkey" FOREIGN KEY ("busScheduleId") REFERENCES "busSchedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
