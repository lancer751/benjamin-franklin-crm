/*
  Warnings:

  - You are about to drop the column `edition_id` on the `Product` table. All the data in the column will be lost.
  - Added the required column `classes_number` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classes_number` to the `Edition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration_unit` to the `Edition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration_value` to the `Edition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hours_amount` to the `Edition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WeekDays" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('REGULAR', 'OVERRIDE');

-- CreateEnum
CREATE TYPE "DurationUnit" AS ENUM ('WEEKS', 'MONTHS');

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_edition_id_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "classes_number" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Edition" ADD COLUMN     "classes_number" INTEGER NOT NULL,
ADD COLUMN     "duration_unit" "DurationUnit" NOT NULL,
ADD COLUMN     "duration_value" INTEGER NOT NULL,
ADD COLUMN     "hours_amount" INTEGER NOT NULL,
ALTER COLUMN "meet_link" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "edition_id",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "EditionSchedule" (
    "id" CHAR(36) NOT NULL,
    "edition_id" TEXT NOT NULL,
    "day_of_week" "WeekDays" NOT NULL,
    "type" "ScheduleType" NOT NULL DEFAULT 'REGULAR',
    "valid_from" DATE,
    "valid_until" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditionScheduleSlot" (
    "id" CHAR(36) NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "EditionScheduleSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductItem" (
    "id" CHAR(36) NOT NULL,
    "edition_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "ProductItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EditionSchedule_edition_id_idx" ON "EditionSchedule"("edition_id");

-- CreateIndex
CREATE INDEX "EditionScheduleSlot_schedule_id_idx" ON "EditionScheduleSlot"("schedule_id");

-- AddForeignKey
ALTER TABLE "EditionSchedule" ADD CONSTRAINT "EditionSchedule_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "Edition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditionScheduleSlot" ADD CONSTRAINT "EditionScheduleSlot_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "EditionSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductItem" ADD CONSTRAINT "ProductItem_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "Edition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductItem" ADD CONSTRAINT "ProductItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
