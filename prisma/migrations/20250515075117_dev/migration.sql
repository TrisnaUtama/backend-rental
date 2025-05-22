/*
  Warnings:

  - The values [WAITING_PAYMENT] on the enum `Booking_Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Booking_Status_new" AS ENUM ('SUBMITTED', 'RECEIVED', 'IN_PROGRESS', 'COMPLETE', 'CANCELED', 'REJECTED', 'REFUNDED');
ALTER TABLE "Bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Bookings" ALTER COLUMN "status" TYPE "Booking_Status_new" USING ("status"::text::"Booking_Status_new");
ALTER TYPE "Booking_Status" RENAME TO "Booking_Status_old";
ALTER TYPE "Booking_Status_new" RENAME TO "Booking_Status";
DROP TYPE "Booking_Status_old";
ALTER TABLE "Bookings" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;
