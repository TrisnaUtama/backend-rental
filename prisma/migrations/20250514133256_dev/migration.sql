/*
  Warnings:

  - The values [ONLINE] on the enum `Payment_Method` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "Booking_Status" ADD VALUE 'WAITING_PAYMENT';

-- AlterEnum
BEGIN;
CREATE TYPE "Payment_Method_new" AS ENUM ('CASH', 'BANK_TRANSFER', 'QRIS', 'EWALLET', 'CREDIT_CARD');
ALTER TABLE "Payments" ALTER COLUMN "payment_method" TYPE "Payment_Method_new" USING ("payment_method"::text::"Payment_Method_new");
ALTER TYPE "Payment_Method" RENAME TO "Payment_Method_old";
ALTER TYPE "Payment_Method_new" RENAME TO "Payment_Method";
DROP TYPE "Payment_Method_old";
COMMIT;

-- AlterEnum
ALTER TYPE "Payment_Status" ADD VALUE 'EXPIRED';
