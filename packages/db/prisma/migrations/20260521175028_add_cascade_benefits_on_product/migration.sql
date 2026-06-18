-- DropForeignKey
ALTER TABLE "BenefitsOnProduct" DROP CONSTRAINT "BenefitsOnProduct_product_id_fkey";

-- AddForeignKey
ALTER TABLE "BenefitsOnProduct" ADD CONSTRAINT "BenefitsOnProduct_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
