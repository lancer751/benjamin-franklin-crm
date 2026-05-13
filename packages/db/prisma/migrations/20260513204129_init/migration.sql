/*
  Warnings:

  - The `moodle_user_status` column on the `CustomerProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `teacher_fullname` on the `Edition` table. All the data in the column will be lost.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "MoodleAccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "CustomerProfile" DROP COLUMN "moodle_user_status",
ADD COLUMN     "moodle_user_status" "MoodleAccountStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Edition" DROP COLUMN "teacher_fullname";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;

-- DropEnum
DROP TYPE "MoodleStudentStatus";

-- CreateTable
CREATE TABLE "Professor" (
    "id" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "corporate_email" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cellphone" TEXT NOT NULL,
    "moddle_account_id" INTEGER NOT NULL,
    "moodle_user_status" "MoodleAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProffessorsOnEditions" (
    "professor_id" TEXT NOT NULL,
    "edition_id" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProffessorsOnEditions_pkey" PRIMARY KEY ("professor_id","edition_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Professor_email_key" ON "Professor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_moddle_account_id_key" ON "Professor"("moddle_account_id");

-- AddForeignKey
ALTER TABLE "ProffessorsOnEditions" ADD CONSTRAINT "ProffessorsOnEditions_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "Professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProffessorsOnEditions" ADD CONSTRAINT "ProffessorsOnEditions_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "Edition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
