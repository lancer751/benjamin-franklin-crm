/*
  Warnings:

  - The values [LUES] on the enum `WeekDays` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cellphone]` on the table `Professor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WeekDays_new" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');
ALTER TABLE "EditionSchedule" ALTER COLUMN "day_of_week" TYPE "WeekDays_new" USING ("day_of_week"::text::"WeekDays_new");
ALTER TYPE "WeekDays" RENAME TO "WeekDays_old";
ALTER TYPE "WeekDays_new" RENAME TO "WeekDays";
DROP TYPE "public"."WeekDays_old";
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_cellphone_key" ON "Professor"("cellphone");
