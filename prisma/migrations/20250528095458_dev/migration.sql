/*
  Warnings:

  - Added the required column `category` to the `Destinations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Destinations" ADD COLUMN     "category" TEXT NOT NULL;
