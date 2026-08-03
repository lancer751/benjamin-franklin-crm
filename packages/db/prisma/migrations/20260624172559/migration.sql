-- AlterTable
ALTER TABLE "Edition" ADD COLUMN     "syllabus_url" TEXT;

-- AlterTable
ALTER TABLE "Professor" ADD COLUMN     "curriculum_vitae" TEXT,
ADD COLUMN     "linkedin_account_url" TEXT,
ADD COLUMN     "profession" TEXT,
ALTER COLUMN "moddle_account_id" DROP NOT NULL;
