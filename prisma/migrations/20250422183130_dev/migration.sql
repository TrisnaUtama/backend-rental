/*
  Warnings:

  - The primary key for the `OTPs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `otp_id` on the `OTPs` table. All the data in the column will be lost.
  - The required column `id` was added to the `OTPs` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "OTPs" DROP CONSTRAINT "OTPs_pkey",
DROP COLUMN "otp_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "OTPs_pkey" PRIMARY KEY ("id");
