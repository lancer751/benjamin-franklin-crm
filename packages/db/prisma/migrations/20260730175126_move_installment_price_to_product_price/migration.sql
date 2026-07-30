/*
  Warnings:

  - You are about to drop the column `installment_price` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "installment_price";

-- AlterTable
ALTER TABLE "ProductPrice" ADD COLUMN     "installment_price" DECIMAL(10,2);
