/*
  Warnings:

  - You are about to drop the column `selected_pax` on the `Bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bookings" DROP COLUMN "selected_pax",
ADD COLUMN     "pax_option_id" TEXT;

-- CreateTable
CREATE TABLE "_BookingsToTravel_Packages_Pax" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BookingsToTravel_Packages_Pax_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BookingsToTravel_Packages_Pax_B_index" ON "_BookingsToTravel_Packages_Pax"("B");

-- AddForeignKey
ALTER TABLE "_BookingsToTravel_Packages_Pax" ADD CONSTRAINT "_BookingsToTravel_Packages_Pax_A_fkey" FOREIGN KEY ("A") REFERENCES "Bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookingsToTravel_Packages_Pax" ADD CONSTRAINT "_BookingsToTravel_Packages_Pax_B_fkey" FOREIGN KEY ("B") REFERENCES "Travel_Packages_Pax"("id") ON DELETE CASCADE ON UPDATE CASCADE;
