/*
  Warnings:

  - You are about to drop the column `campaign_id` on the `edition` table. All the data in the column will be lost.
  - You are about to alter the column `discount_code` on the `orderdetail` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(7)`.
  - A unique constraint covering the columns `[edition_id]` on the table `Campaing` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `edition_id` to the `Campaing` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `edition` DROP FOREIGN KEY `Edition_campaign_id_fkey`;

-- DropIndex
DROP INDEX `Edition_campaign_id_fkey` ON `edition`;

-- AlterTable
ALTER TABLE `campaing` ADD COLUMN `edition_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `edition` DROP COLUMN `campaign_id`;

-- AlterTable
ALTER TABLE `orderdetail` MODIFY `discount_code` CHAR(7) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Campaing_edition_id_key` ON `Campaing`(`edition_id`);

-- AddForeignKey
ALTER TABLE `CampaingMember` ADD CONSTRAINT `CampaingMember_campaing_id_fkey` FOREIGN KEY (`campaing_id`) REFERENCES `Campaing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaing` ADD CONSTRAINT `Campaing_edition_id_fkey` FOREIGN KEY (`edition_id`) REFERENCES `Edition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
