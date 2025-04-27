/*
  Warnings:

  - Added the required column `status` to the `Destinations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Destinations" ADD COLUMN     "status" BOOLEAN NOT NULL;
