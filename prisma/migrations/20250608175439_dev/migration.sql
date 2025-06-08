/*
  Warnings:

  - You are about to drop the column `pax_option_id` on the `Bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bookings" DROP COLUMN "pax_option_id",
ADD COLUMN     "selected_pax" TEXT;
