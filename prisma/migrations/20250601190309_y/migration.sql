/*
  Warnings:

  - You are about to drop the column `vehicle_id` on the `Bookings` table. All the data in the column will be lost.
  - You are about to drop the column `overnight_location` on the `Travel_Itineraries` table. All the data in the column will be lost.
  - You are about to drop the `Travel_Package_Vehicles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bookings" DROP CONSTRAINT "Bookings_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "Travel_Package_Vehicles" DROP CONSTRAINT "Travel_Package_Vehicles_travel_package_id_fkey";

-- DropForeignKey
ALTER TABLE "Travel_Package_Vehicles" DROP CONSTRAINT "Travel_Package_Vehicles_vehicle_id_fkey";

-- AlterTable
ALTER TABLE "Bookings" DROP COLUMN "vehicle_id";

-- AlterTable
ALTER TABLE "Travel_Itineraries" DROP COLUMN "overnight_location",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "Travel_Package_Vehicles";

-- CreateTable
CREATE TABLE "Booking_Vehicles" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,

    CONSTRAINT "Booking_Vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BookingsToVehicles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BookingsToVehicles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BookingsToVehicles_B_index" ON "_BookingsToVehicles"("B");

-- AddForeignKey
ALTER TABLE "Booking_Vehicles" ADD CONSTRAINT "Booking_Vehicles_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking_Vehicles" ADD CONSTRAINT "Booking_Vehicles_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookingsToVehicles" ADD CONSTRAINT "_BookingsToVehicles_A_fkey" FOREIGN KEY ("A") REFERENCES "Bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookingsToVehicles" ADD CONSTRAINT "_BookingsToVehicles_B_fkey" FOREIGN KEY ("B") REFERENCES "Vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
