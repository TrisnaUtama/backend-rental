/*
  Warnings:

  - You are about to drop the column `discount_type` on the `Promos` table. All the data in the column will be lost.
  - You are about to alter the column `discount_value` on the `Promos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - The `status` column on the `Promos` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Promos" DROP COLUMN "discount_type",
ALTER COLUMN "discount_value" SET DATA TYPE INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- DropEnum
DROP TYPE "Discount_Type";
