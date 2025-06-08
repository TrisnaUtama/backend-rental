/*
  Warnings:

  - Added the required column `updated_at` to the `Travel_Packages_Pax` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bookings" ADD COLUMN     "pax_option_id" TEXT;

-- AlterTable
ALTER TABLE "Travel_Packages_Pax" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
