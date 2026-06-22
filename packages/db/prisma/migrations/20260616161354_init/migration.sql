/*
  Warnings:

  - You are about to drop the column `campaing_name` on the `Campaing` table. All the data in the column will be lost.
  - Added the required column `name` to the `Campaing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaing" DROP COLUMN "campaing_name",
ADD COLUMN     "name" TEXT NOT NULL;
