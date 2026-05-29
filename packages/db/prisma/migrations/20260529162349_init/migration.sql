-- CreateEnum
CREATE TYPE "ProductPricingStatus" AS ENUM ('VALID', 'INVALID');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "pricing_status" "ProductPricingStatus" NOT NULL DEFAULT 'VALID';
