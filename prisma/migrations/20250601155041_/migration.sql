/*
  Warnings:

  - Added the required column `comment` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "comment" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Travel_Packages" ADD COLUMN     "accommodation_id" TEXT;

-- CreateTable
CREATE TABLE "Accommodations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "image_urls" TEXT[],
    "price_per_night" DECIMAL(65,30) NOT NULL,
    "rating" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accommodations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Travel_Itineraries" (
    "id" TEXT NOT NULL,
    "travel_package_id" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL,
    "destination_id" TEXT NOT NULL,
    "description" TEXT,
    "overnight_location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Travel_Itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Travel_Package_Vehicles" (
    "id" TEXT NOT NULL,
    "travel_package_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "Travel_Package_Vehicles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Travel_Itineraries" ADD CONSTRAINT "Travel_Itineraries_travel_package_id_fkey" FOREIGN KEY ("travel_package_id") REFERENCES "Travel_Packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Travel_Itineraries" ADD CONSTRAINT "Travel_Itineraries_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "Destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Travel_Package_Vehicles" ADD CONSTRAINT "Travel_Package_Vehicles_travel_package_id_fkey" FOREIGN KEY ("travel_package_id") REFERENCES "Travel_Packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Travel_Package_Vehicles" ADD CONSTRAINT "Travel_Package_Vehicles_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Travel_Packages" ADD CONSTRAINT "Travel_Packages_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "Accommodations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
