/*
  Warnings:

  - You are about to drop the column `active_sellers` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `avg_team_response_time` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `can_approve_discounts` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `can_assign_leads` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `can_cancel_orders` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `can_reassign_leads` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `can_view_all_team_sales` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `cancelled_team_orders` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `completed_team_orders` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `discount_limit_percent` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `max_manual_discount` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `supervised_sellers` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `team_conversion_rate` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `team_name` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `total_team_orders` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `total_team_sales` on the `SalesSupervisorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `lead_id` on the `Tasks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tasks" DROP CONSTRAINT "Tasks_lead_id_fkey";

-- AlterTable
ALTER TABLE "SalesSupervisorProfile" DROP COLUMN "active_sellers",
DROP COLUMN "avg_team_response_time",
DROP COLUMN "can_approve_discounts",
DROP COLUMN "can_assign_leads",
DROP COLUMN "can_cancel_orders",
DROP COLUMN "can_reassign_leads",
DROP COLUMN "can_view_all_team_sales",
DROP COLUMN "cancelled_team_orders",
DROP COLUMN "completed_team_orders",
DROP COLUMN "discount_limit_percent",
DROP COLUMN "max_manual_discount",
DROP COLUMN "supervised_sellers",
DROP COLUMN "team_conversion_rate",
DROP COLUMN "team_name",
DROP COLUMN "total_team_orders",
DROP COLUMN "total_team_sales";

-- AlterTable
ALTER TABLE "Tasks" DROP COLUMN "lead_id";
