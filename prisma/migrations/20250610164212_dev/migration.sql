/*
  Warnings:

  - The values [PROCESSING] on the enum `Refund_Status` will be removed. If these variants are still used in the database, this will fail.
  - The `refund_method` column on the `Refunds` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `account_holder` to the `Refunds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_number` to the `Refunds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bank_name` to the `Refunds` table without a default value. This is not possible if the table is not empty.
  - Made the column `reason` on table `Refunds` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Refund_Status_new" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELED_BY_USER');
ALTER TABLE "Refunds" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Refunds" ALTER COLUMN "status" TYPE "Refund_Status_new" USING ("status"::text::"Refund_Status_new");
ALTER TYPE "Refund_Status" RENAME TO "Refund_Status_old";
ALTER TYPE "Refund_Status_new" RENAME TO "Refund_Status";
DROP TYPE "Refund_Status_old";
ALTER TABLE "Refunds" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Refunds" ADD COLUMN     "account_holder" TEXT NOT NULL,
ADD COLUMN     "account_number" TEXT NOT NULL,
ADD COLUMN     "bank_name" TEXT NOT NULL,
ADD COLUMN     "transfer_proof" TEXT,
ALTER COLUMN "reason" SET NOT NULL,
DROP COLUMN "refund_method",
ADD COLUMN     "refund_method" TEXT;
