/*
  Warnings:

  - You are about to drop the column `latitude` on the `Destinations` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Destinations` table. All the data in the column will be lost.
  - You are about to drop the `Destination_Fasilities` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `address` to the `Destinations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Destinations" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "address" TEXT NOT NULL;

-- DropTable
DROP TABLE "Destination_Fasilities";
