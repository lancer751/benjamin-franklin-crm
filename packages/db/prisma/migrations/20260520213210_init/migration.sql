/*
  Warnings:

  - You are about to drop the column `product_id` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `FAQ` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Certification_product_id_key";

-- AlterTable
ALTER TABLE "Certification" DROP COLUMN "product_id";

-- AlterTable
ALTER TABLE "FAQ" DROP COLUMN "product_id";
