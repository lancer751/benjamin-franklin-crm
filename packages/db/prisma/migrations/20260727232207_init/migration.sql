/*
  Warnings:

  - The values [NEW,CONTACTED,QUALIFIED,UNQUALIFIED,ATTEMPTED_CONTACT,FOLLOW_UP,ON_HOLD,WON,LOST] on the enum `CampaignMemberStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `discount_code` on the `OrderDetail` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `PaymentPlan` table. All the data in the column will be lost.
  - You are about to drop the column `presale_price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `enrollment_fee` on the `ProductPrice` table. All the data in the column will be lost.
  - You are about to drop the column `installment_price` on the `ProductPrice` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_detail_id]` on the table `PaymentPlan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `attendance_mode` to the `OrderDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `base_price` to the `OrderDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_modality` to the `OrderDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_detail_id` to the `PaymentPlan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterEnum
BEGIN;
CREATE TYPE "CampaignMemberStatus_new" AS ENUM ('NUEVO', 'CONTACTADO', 'NO_CONTACTADO', 'NEGOCIACION', 'SEGUIMIENTO', 'EN_ESPERA', 'MATRICULADO', 'PERDIDO');
ALTER TABLE "public"."CampaignMember" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CampaignMember" ALTER COLUMN "status" TYPE "CampaignMemberStatus_new" USING ("status"::text::"CampaignMemberStatus_new");
ALTER TYPE "CampaignMemberStatus" RENAME TO "CampaignMemberStatus_old";
ALTER TYPE "CampaignMemberStatus_new" RENAME TO "CampaignMemberStatus";
DROP TYPE "public"."CampaignMemberStatus_old";
ALTER TABLE "CampaignMember" ALTER COLUMN "status" SET DEFAULT 'NUEVO';
COMMIT;

-- DropForeignKey
ALTER TABLE "CampaignMember" DROP CONSTRAINT "CampaignMember_assigned_to_fkey";

-- DropForeignKey
ALTER TABLE "LeadInteraction" DROP CONSTRAINT "LeadInteraction_created_by_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_generated_by_fkey";

-- DropForeignKey
ALTER TABLE "PaymentPlan" DROP CONSTRAINT "PaymentPlan_order_id_fkey";

-- DropIndex
DROP INDEX "PaymentPlan_order_id_idx";

-- AlterTable
ALTER TABLE "CampaignMember" ALTER COLUMN "status" SET DEFAULT 'NUEVO';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "assigned_to" TEXT;

-- AlterTable
ALTER TABLE "OrderDetail" DROP COLUMN "discount_code",
ADD COLUMN     "attendance_mode" "AttendanceMode" NOT NULL,
ADD COLUMN     "base_price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "discount_code_id" TEXT,
ADD COLUMN     "enrollment_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "payment_modality" "PaymentType" NOT NULL;

-- AlterTable
ALTER TABLE "PaymentPlan" DROP COLUMN "order_id",
ADD COLUMN     "order_detail_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "presale_price",
ADD COLUMN     "enrollment_fee" DECIMAL(10,2),
ADD COLUMN     "installment_price" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "ProductPrice" DROP COLUMN "enrollment_fee",
DROP COLUMN "installment_price";

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" CHAR(36) NOT NULL,
    "code" CHAR(7) NOT NULL,
    "type" "DiscountType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "product_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "max_uses" INTEGER,
    "times_used" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");

-- CreateIndex
CREATE INDEX "DiscountCode_product_id_idx" ON "DiscountCode"("product_id");

-- CreateIndex
CREATE INDEX "DiscountCode_is_active_idx" ON "DiscountCode"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentPlan_order_detail_id_key" ON "PaymentPlan"("order_detail_id");

-- CreateIndex
CREATE INDEX "PaymentPlan_order_detail_id_idx" ON "PaymentPlan"("order_detail_id");

-- AddForeignKey
ALTER TABLE "CampaignMember" ADD CONSTRAINT "CampaignMember_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadInteraction" ADD CONSTRAINT "LeadInteraction_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_discount_code_id_fkey" FOREIGN KEY ("discount_code_id") REFERENCES "DiscountCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPlan" ADD CONSTRAINT "PaymentPlan_order_detail_id_fkey" FOREIGN KEY ("order_detail_id") REFERENCES "OrderDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
