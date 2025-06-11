/*
  Warnings:

  - Added the required column `payment_method` to the `Payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RescheduleStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Payments" DROP COLUMN "payment_method",
ADD COLUMN     "payment_method" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RescheduleRequest" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "new_start_date" TIMESTAMP(3) NOT NULL,
    "new_end_date" TIMESTAMP(3) NOT NULL,
    "status" "RescheduleStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RescheduleRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RescheduleRequest" ADD CONSTRAINT "RescheduleRequest_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
