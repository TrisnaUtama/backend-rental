-- AlterTable
ALTER TABLE "Notifications" ADD COLUMN     "promo_id" TEXT;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "Promos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
