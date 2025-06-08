/*
  Warnings:

  - You are about to drop the `_BookingsToTravel_Packages_Pax` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BookingsToTravel_Packages_Pax" DROP CONSTRAINT "_BookingsToTravel_Packages_Pax_A_fkey";

-- DropForeignKey
ALTER TABLE "_BookingsToTravel_Packages_Pax" DROP CONSTRAINT "_BookingsToTravel_Packages_Pax_B_fkey";

-- DropTable
DROP TABLE "_BookingsToTravel_Packages_Pax";

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_pax_option_id_fkey" FOREIGN KEY ("pax_option_id") REFERENCES "Travel_Packages_Pax"("id") ON DELETE SET NULL ON UPDATE CASCADE;
