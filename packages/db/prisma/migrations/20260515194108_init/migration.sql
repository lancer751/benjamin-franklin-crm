/*
  Warnings:

  - You are about to drop the `CourseBenefit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CourseBenefit" DROP CONSTRAINT "CourseBenefit_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_role_id_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "enrolled_students" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "CourseBenefit";

-- DropTable
DROP TABLE "Permission";

-- CreateTable
CREATE TABLE "Benefit" (
    "id" CHAR(36) NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,

    CONSTRAINT "Benefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenefitsOnProduct" (
    "product_id" TEXT NOT NULL,
    "benefit_id" TEXT NOT NULL,

    CONSTRAINT "BenefitsOnProduct_pkey" PRIMARY KEY ("product_id","benefit_id")
);

-- CreateTable
CREATE TABLE "StudyPlan" (
    "id" CHAR(36) NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlanModule" (
    "id" CHAR(36) NOT NULL,
    "study_plan_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "StudyPlanModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlanTopic" (
    "id" CHAR(36) NOT NULL,
    "module_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "StudyPlanTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" CHAR(36) NOT NULL,
    "product_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" CHAR(36) NOT NULL,
    "product_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "has_digital" BOOLEAN NOT NULL DEFAULT true,
    "has_physical" BOOLEAN NOT NULL DEFAULT true,
    "issuing_authority" TEXT,
    "registry_validity" TEXT,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Certification_product_id_key" ON "Certification"("product_id");

-- AddForeignKey
ALTER TABLE "BenefitsOnProduct" ADD CONSTRAINT "BenefitsOnProduct_benefit_id_fkey" FOREIGN KEY ("benefit_id") REFERENCES "Benefit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenefitsOnProduct" ADD CONSTRAINT "BenefitsOnProduct_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanModule" ADD CONSTRAINT "StudyPlanModule_study_plan_id_fkey" FOREIGN KEY ("study_plan_id") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanTopic" ADD CONSTRAINT "StudyPlanTopic_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "StudyPlanModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
