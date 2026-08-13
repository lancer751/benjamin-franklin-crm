/*
  Warnings:

  - You are about to drop the column `syllabus_url` on the `Edition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Edition" DROP COLUMN "syllabus_url",
ADD COLUMN     "demo_date" TIMESTAMP(3);
