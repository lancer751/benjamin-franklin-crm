/*
  Warnings:

  - You are about to drop the column `edition_id` on the `Campaing` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[product_id]` on the table `Campaing` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `product_id` to the `Campaing` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Campaing" DROP CONSTRAINT "Campaing_edition_id_fkey";

-- DropIndex
DROP INDEX "Campaing_edition_id_key";

-- AlterTable
ALTER TABLE "Campaing" DROP COLUMN "edition_id",
ADD COLUMN     "product_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Campaing_product_id_key" ON "Campaing"("product_id");

-- AddForeignKey
ALTER TABLE "Campaing" ADD CONSTRAINT "Campaing_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
