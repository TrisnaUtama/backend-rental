/*
  Warnings:

  - The values [REJECTED_RESHECULE] on the enum `Booking_Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Booking_Status_new" AS ENUM ('SUBMITTED', 'PAYMENT_PENDING', 'RECEIVED', 'COMPLETE', 'CANCELED', 'REJECTED_BOOKING', 'REJECTED_REFUND', 'REJECTED_RESHEDULE', 'RESCHEDULE_REQUESTED', 'RESCHEDULED', 'REFUND_REQUESTED', 'REFUNDED', 'CONFIRMED');
ALTER TABLE "Bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Bookings" ALTER COLUMN "status" TYPE "Booking_Status_new" USING ("status"::text::"Booking_Status_new");
ALTER TYPE "Booking_Status" RENAME TO "Booking_Status_old";
ALTER TYPE "Booking_Status_new" RENAME TO "Booking_Status";
DROP TYPE "Booking_Status_old";
ALTER TABLE "Bookings" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;
