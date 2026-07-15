-- AlterTable
ALTER TABLE "Campaing" ADD COLUMN     "click_to_whatsapp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leads_last_synced_at" TIMESTAMP(3),
ADD COLUMN     "meta_campaign_id" TEXT,
ADD COLUMN     "next_seller_cursor" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "whatsapp_number" TEXT;

-- CreateIndex
CREATE INDEX "Campaing_meta_form_id_idx" ON "Campaing"("meta_form_id");
