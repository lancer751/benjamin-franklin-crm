/*
  Warnings:

  - You are about to alter the column `moodle_course_id` on the `edicion` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `edicion` MODIFY `moodle_course_id` INTEGER NULL;
