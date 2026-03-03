/*
  Warnings:

  - You are about to alter the column `telefono` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(9)`.
  - You are about to alter the column `dni` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(8)`.
  - You are about to drop the column `curso_id` on the `matricula` table. All the data in the column will be lost.
  - You are about to drop the column `moodle_enrollment_id` on the `matricula` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `matricula` DROP FOREIGN KEY `Matricula_curso_id_fkey`;

-- DropIndex
DROP INDEX `Matricula_curso_id_fkey` ON `matricula`;

-- DropIndex
DROP INDEX `Matricula_moodle_enrollment_id_key` ON `matricula`;

-- AlterTable
ALTER TABLE `cliente` MODIFY `telefono` CHAR(9) NULL,
    MODIFY `dni` CHAR(8) NOT NULL;

-- AlterTable
ALTER TABLE `matricula` DROP COLUMN `curso_id`,
    DROP COLUMN `moodle_enrollment_id`,
    ADD COLUMN `edicion_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Matricula` ADD CONSTRAINT `Matricula_edicion_id_fkey` FOREIGN KEY (`edicion_id`) REFERENCES `Edicion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
