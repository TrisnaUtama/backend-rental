/*
  Warnings:

  - Added the required column `token` to the `Payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payments" ADD COLUMN     "token" TEXT NOT NULL;
