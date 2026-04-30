/*
  Warnings:

  - Made the column `assigned_supervisor_id` on table `SellerProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "SellerProfile" DROP CONSTRAINT "SellerProfile_assigned_supervisor_id_fkey";

-- AlterTable
ALTER TABLE "SalesSupervisorProfile" ADD COLUMN     "active_sellers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "avg_team_response_time" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "can_approve_discounts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "can_assign_leads" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "can_cancel_orders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "can_reassign_leads" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "can_view_all_team_sales" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cancelled_team_orders" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "completed_team_orders" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "discount_limit_percent" DECIMAL(5,2) NOT NULL DEFAULT 10,
ADD COLUMN     "max_manual_discount" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "max_sellers" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "supervised_sellers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "team_conversion_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "team_name" TEXT,
ADD COLUMN     "total_team_orders" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_team_sales" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SellerProfile" ALTER COLUMN "assigned_supervisor_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "SellerProfile" ADD CONSTRAINT "SellerProfile_assigned_supervisor_id_fkey" FOREIGN KEY ("assigned_supervisor_id") REFERENCES "SalesSupervisorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
