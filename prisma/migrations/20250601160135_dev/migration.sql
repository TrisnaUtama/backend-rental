/*
  Warnings:

  - Added the required column `status` to the `Accommodations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Accommodations" ADD COLUMN     "status" BOOLEAN NOT NULL;
