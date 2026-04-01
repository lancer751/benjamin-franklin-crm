/*
  Warnings:

  - You are about to drop the column `assigned_to` on the `lead` table. All the data in the column will be lost.
  - You are about to drop the column `campaign_id` on the `lead` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `lead` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `lead` table. All the data in the column will be lost.
  - You are about to alter the column `lead_status` on the `lead` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(10))` to `Enum(EnumId(5))`.
  - You are about to drop the column `nombre` on the `modality` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `role` table. All the data in the column will be lost.
  - You are about to drop the `lead_interactions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[edition_code]` on the table `Edition` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Modality` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `Campaing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Modality` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `lead` DROP FOREIGN KEY `Lead_assigned_to_fkey`;

-- DropForeignKey
ALTER TABLE `lead` DROP FOREIGN KEY `Lead_campaign_id_fkey`;

-- DropForeignKey
ALTER TABLE `lead_interactions` DROP FOREIGN KEY `Lead_Interactions_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `lead_interactions` DROP FOREIGN KEY `Lead_Interactions_lead_id_fkey`;

-- DropIndex
DROP INDEX `Lead_assigned_to_idx` ON `lead`;

-- DropIndex
DROP INDEX `Lead_campaign_id_fkey` ON `lead`;

-- DropIndex
DROP INDEX `Lead_lead_status_idx` ON `lead`;

-- DropIndex
DROP INDEX `Modality_nombre_key` ON `modality`;

-- AlterTable
ALTER TABLE `campaing` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ALTER COLUMN `start_date` DROP DEFAULT;

-- AlterTable
ALTER TABLE `edition` MODIFY `edition_code` CHAR(12) NOT NULL;

-- AlterTable
ALTER TABLE `lead` DROP COLUMN `assigned_to`,
    DROP COLUMN `campaign_id`,
    DROP COLUMN `score`,
    DROP COLUMN `source`,
    ADD COLUMN `primary_campaign_id` VARCHAR(191) NULL,
    MODIFY `lead_status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `modality` DROP COLUMN `nombre`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `product` MODIFY `discount_price` DECIMAL(10, 2) NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `role` DROP COLUMN `created_at`,
    DROP COLUMN `updated_at`;

-- DropTable
DROP TABLE `lead_interactions`;

-- CreateTable
CREATE TABLE `CampaingMember` (
    `id` CHAR(36) NOT NULL,
    `lead_id` VARCHAR(191) NOT NULL,
    `campaing_id` VARCHAR(191) NOT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'ATTEMPTED_CONTACT', 'QUALIFIED', 'UNQUALIFIED', 'IN_PROGRESS', 'NEGOTIATION', 'PROPOSAL_SENT', 'WON', 'LOST', 'REJECTED', 'FOLLOW_UP', 'ON_HOLD') NOT NULL DEFAULT 'NEW',
    `assigned_to` VARCHAR(191) NULL,
    `source` ENUM('FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'WHATSAPP', 'WEBSITE') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,

    INDEX `CampaingMember_status_idx`(`status`),
    INDEX `CampaingMember_assigned_to_idx`(`assigned_to`),
    UNIQUE INDEX `CampaingMember_campaing_id_is_primary_key`(`campaing_id`, `is_primary`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeadInteraction` (
    `id` CHAR(36) NOT NULL,
    `lead_id` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NOT NULL,
    `created_by` VARCHAR(191) NULL,
    `campaing_id` VARCHAR(191) NOT NULL,
    `type` ENUM('WEBSITE_FORM', 'SELL', 'WHATSAPP', 'EMAIL', 'MEETING', 'CALL') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Edition_edition_code_key` ON `Edition`(`edition_code`);

-- CreateIndex
CREATE UNIQUE INDEX `Modality_name_key` ON `Modality`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Role_name_key` ON `Role`(`name`);

-- AddForeignKey
ALTER TABLE `CampaingMember` ADD CONSTRAINT `CampaingMember_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `Lead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaingMember` ADD CONSTRAINT `CampaingMember_campaing_id_fkey` FOREIGN KEY (`campaing_id`) REFERENCES `Campaing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaingMember` ADD CONSTRAINT `CampaingMember_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `SellerProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_primary_campaign_id_fkey` FOREIGN KEY (`primary_campaign_id`) REFERENCES `Campaing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeadInteraction` ADD CONSTRAINT `LeadInteraction_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `Lead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeadInteraction` ADD CONSTRAINT `LeadInteraction_campaing_id_fkey` FOREIGN KEY (`campaing_id`) REFERENCES `CampaingMember`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeadInteraction` ADD CONSTRAINT `LeadInteraction_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `SellerProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
