-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LeadPhone" ADD COLUMN     "isPrincipal" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Lead_deleted_at_idx" ON "Lead"("deleted_at");

-- CreateIndex
CREATE INDEX "LeadPhone_lead_id_idx" ON "LeadPhone"("lead_id");
