-- AlterTable
ALTER TABLE "Destinations" ALTER COLUMN "status" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Notification_Broadcast" ALTER COLUMN "status" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Notifications" ALTER COLUMN "status" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Travel_Packages" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;
