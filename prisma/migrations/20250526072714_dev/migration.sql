-- DropForeignKey
ALTER TABLE "Destination_Fasilities" DROP CONSTRAINT "Destination_Fasilities_destination_id_fkey";

-- AlterTable
ALTER TABLE "Destinations" ADD COLUMN     "facilities" TEXT[];
