/*
  Warnings:

  - You are about to drop the column `sales_closed` on the `sellerprofile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sellerprofile` DROP COLUMN `sales_closed`,
    MODIFY `max_discount` DECIMAL(65, 30) NULL DEFAULT 0;
