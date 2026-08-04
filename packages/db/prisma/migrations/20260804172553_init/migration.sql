/*
  Warnings:

  - You are about to drop the column `lead_id` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `installment_price` on the `Product` table. All the data in the column will be lost.
  - Added the required column `member_id` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_lead_id_fkey";

-- DropIndex
DROP INDEX "Order_lead_id_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "lead_id",
ADD COLUMN     "member_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "installment_price";

-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Order_member_id_idx" ON "Order"("member_id");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "CampaignMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
