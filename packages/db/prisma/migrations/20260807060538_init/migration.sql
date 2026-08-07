/*
  Warnings:

  - Added the required column `created_by` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `payment_receipt` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "reviewed_by" TEXT,
ALTER COLUMN "payment_receipt" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Payment_order_id_idx" ON "Payment"("order_id");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
