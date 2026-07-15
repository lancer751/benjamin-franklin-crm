/*
  Warnings:

  - A unique constraint covering the columns `[meta_leadgen_id]` on the table `CampaignMember` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CampaignMember" ADD COLUMN     "meta_leadgen_id" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LeadPhone" ADD COLUMN     "isPrincipal" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMember_meta_leadgen_id_key" ON "CampaignMember"("meta_leadgen_id");

-- CreateIndex
CREATE INDEX "Lead_deleted_at_idx" ON "Lead"("deleted_at");

-- CreateIndex
CREATE INDEX "LeadPhone_lead_id_idx" ON "LeadPhone"("lead_id");
