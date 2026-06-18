/*
  Warnings:

  - Added the required column `supervisor_id` to the `Campaing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaign_member_id` to the `Tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `Tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lead_id` to the `Tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaing" ADD COLUMN     "meta_form_id" TEXT,
ADD COLUMN     "supervisor_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "first_name" DROP NOT NULL,
ALTER COLUMN "middle_name" DROP NOT NULL,
ALTER COLUMN "last_name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "campaign_member_id" TEXT NOT NULL,
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "due_date" TIMESTAMP(3),
ADD COLUMN     "is_done" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lead_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_campaign_member_id_fkey" FOREIGN KEY ("campaign_member_id") REFERENCES "CampaignMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaing" ADD CONSTRAINT "Campaing_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "SalesSupervisorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
