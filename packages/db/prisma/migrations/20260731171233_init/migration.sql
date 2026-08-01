/*
  Warnings:

  - You are about to drop the column `enrollment_fee` on the `OrderDetail` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tasks" DROP CONSTRAINT "Tasks_created_by_fkey";

-- AlterTable
ALTER TABLE "OrderDetail" DROP COLUMN "enrollment_fee";

-- AlterTable
ALTER TABLE "ProductPrice" ADD COLUMN     "installment_price" DECIMAL(10,2);

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
