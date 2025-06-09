/*
  Warnings:

  - The values [IN_PROGRESS] on the enum `Booking_Status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `_BookingsToVehicles` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Refund_Status" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELED_BY_USER');

-- AlterEnum
BEGIN;
CREATE TYPE "Booking_Status_new" AS ENUM ('SUBMITTED', 'PAYMENT_PENDING', 'RECEIVED', 'COMPLETE', 'CANCELED', 'REJECTED_BOOKING', 'REJECTED_REFUND', 'REJECTED_RESHECULE', 'RESCHEDULE_REQUESTED', 'RESCHEDULED', 'REFUND_REQUESTED', 'REFUNDED');
ALTER TABLE "Bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Bookings" ALTER COLUMN "status" TYPE "Booking_Status_new" USING ("status"::text::"Booking_Status_new");
ALTER TYPE "Booking_Status" RENAME TO "Booking_Status_old";
ALTER TYPE "Booking_Status_new" RENAME TO "Booking_Status";
DROP TYPE "Booking_Status_old";
ALTER TABLE "Bookings" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;

-- DropForeignKey
ALTER TABLE "_BookingsToVehicles" DROP CONSTRAINT "_BookingsToVehicles_A_fkey";

-- DropForeignKey
ALTER TABLE "_BookingsToVehicles" DROP CONSTRAINT "_BookingsToVehicles_B_fkey";

-- DropTable
DROP TABLE "_BookingsToVehicles";

-- CreateTable
CREATE TABLE "Refunds" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "refund_amount" DECIMAL(65,30) NOT NULL,
    "request_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approval_date" TIMESTAMP(3),
    "processed_by" TEXT,
    "status" "Refund_Status" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "admin_notes" TEXT,
    "refund_method" "Payment_Method",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Refunds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Refunds" ADD CONSTRAINT "Refunds_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refunds" ADD CONSTRAINT "Refunds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refunds" ADD CONSTRAINT "Refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
