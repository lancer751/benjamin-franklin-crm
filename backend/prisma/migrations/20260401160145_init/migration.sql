/*
  Warnings:

  - A unique constraint covering the columns `[lead_id,campaing_id]` on the table `CampaingMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `campaingmember` DROP FOREIGN KEY `CampaingMember_campaing_id_fkey`;

-- DropIndex
DROP INDEX `CampaingMember_campaing_id_is_primary_key` ON `campaingmember`;

-- CreateIndex
CREATE UNIQUE INDEX `CampaingMember_lead_id_campaing_id_key` ON `CampaingMember`(`lead_id`, `campaing_id`);

