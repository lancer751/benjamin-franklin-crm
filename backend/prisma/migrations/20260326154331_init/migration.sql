/*
  Warnings:

  - The values [TELEGRAM] on the enum `Campaing_platform` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `assigned_seller_id` on the `lead` table. All the data in the column will be lost.
  - Added the required column `source` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `Lead_Interactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notes` to the `Lead_Interactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `lead` DROP FOREIGN KEY `Lead_assigned_seller_id_fkey`;

-- DropIndex
DROP INDEX `Lead_assigned_seller_id_idx` ON `lead`;

-- AlterTable
ALTER TABLE `campaing` MODIFY `platform` ENUM('FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'WEBSITE') NOT NULL;

-- AlterTable
ALTER TABLE `lead` DROP COLUMN `assigned_seller_id`,
    ADD COLUMN `assigned_to` VARCHAR(191) NULL,
    ADD COLUMN `campaign_id` VARCHAR(191) NULL,
    ADD COLUMN `score` INTEGER NOT NULL DEFAULT 2,
    ADD COLUMN `source` ENUM('FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'WHATSAPP', 'WEBSITE') NOT NULL;

-- AlterTable
ALTER TABLE `lead_interactions` ADD COLUMN `created_by` VARCHAR(191) NOT NULL,
    ADD COLUMN `notes` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `sellerprofile` MODIFY `sales_target` INTEGER NOT NULL DEFAULT 0,
    MODIFY `sales_closed` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `tasks` ADD COLUMN `content` MEDIUMTEXT NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Lead_assigned_to_idx` ON `Lead`(`assigned_to`);

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `SellerProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `Campaing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead_Interactions` ADD CONSTRAINT `Lead_Interactions_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `SellerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
