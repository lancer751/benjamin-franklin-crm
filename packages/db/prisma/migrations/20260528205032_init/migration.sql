/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `Professor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brochure_url" TEXT;

-- AlterTable
ALTER TABLE "Professor" DROP COLUMN "deleted_at";
