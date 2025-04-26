/*
  Warnings:

  - Added the required column `status` to the `Notification_Broadcast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification_Broadcast" ADD COLUMN     "status" BOOLEAN NOT NULL,
ALTER COLUMN "read_at" DROP NOT NULL,
ALTER COLUMN "sent_at" DROP NOT NULL;
