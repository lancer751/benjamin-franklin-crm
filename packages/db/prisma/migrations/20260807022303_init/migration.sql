/*
  Warnings:

  - You are about to drop the column `status` on the `PaymentPlan` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PaymentPlan_order_detail_id_idx";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "order_detail_id" TEXT;

-- AlterTable
ALTER TABLE "PaymentPlan" DROP COLUMN "status";

-- CreateIndex
CREATE INDEX "ScheduledPayment_status_idx" ON "ScheduledPayment"("status");

-- CreateIndex
CREATE INDEX "ScheduledPayment_due_date_idx" ON "ScheduledPayment"("due_date");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_order_detail_id_fkey" FOREIGN KEY ("order_detail_id") REFERENCES "OrderDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
