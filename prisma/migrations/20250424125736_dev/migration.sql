/*
  Warnings:

  - You are about to drop the column `is_sent` on the `Notifications` table. All the data in the column will be lost.
  - You are about to drop the column `via_email` on the `Notifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notifications" DROP COLUMN "is_sent",
DROP COLUMN "via_email";
