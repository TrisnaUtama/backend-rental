/*
  Warnings:

  - You are about to drop the column `price` on the `Travel_Packages` table. All the data in the column will be lost.
  - You are about to drop the column `vehicle_id` on the `Travel_Packages` table. All the data in the column will be lost.
  - Added the required column `image` to the `Travel_Packages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Travel_Packages" DROP CONSTRAINT "Travel_Packages_vehicle_id_fkey";

-- AlterTable
ALTER TABLE "Travel_Packages" DROP COLUMN "price",
DROP COLUMN "vehicle_id",
ADD COLUMN     "image" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Travel_Packages_Pax" (
    "id" TEXT NOT NULL,
    "travel_package_id" TEXT NOT NULL,
    "pax" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Travel_Packages_Pax_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Travel_Packages_Pax" ADD CONSTRAINT "Travel_Packages_Pax_travel_package_id_fkey" FOREIGN KEY ("travel_package_id") REFERENCES "Travel_Packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
