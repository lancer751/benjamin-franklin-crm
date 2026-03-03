/*
  Warnings:

  - Made the column `edicion_id` on table `matricula` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `matricula` DROP FOREIGN KEY `Matricula_edicion_id_fkey`;

-- DropIndex
DROP INDEX `Matricula_edicion_id_fkey` ON `matricula`;

-- AlterTable
ALTER TABLE `matricula` MODIFY `edicion_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Matricula` ADD CONSTRAINT `Matricula_edicion_id_fkey` FOREIGN KEY (`edicion_id`) REFERENCES `Edicion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
