/*
  Warnings:

  - You are about to drop the column `transaction_id` on the `Payments` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Booking_Status" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "Booking_Status" ADD VALUE 'COMPLETE';

-- AlterTable
ALTER TABLE "Payments" DROP COLUMN "transaction_id";
