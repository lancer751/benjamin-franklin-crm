-- DropForeignKey
ALTER TABLE "Certification" DROP CONSTRAINT "Certification_product_id_fkey";

-- DropForeignKey
ALTER TABLE "FAQ" DROP CONSTRAINT "FAQ_product_id_fkey";

-- CreateTable
CREATE TABLE "FAQsOnProduct" (
    "product_id" TEXT NOT NULL,
    "faq_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FAQsOnProduct_pkey" PRIMARY KEY ("product_id","faq_id")
);

-- CreateTable
CREATE TABLE "CertificationsOnProduct" (
    "product_id" TEXT NOT NULL,
    "certification_id" TEXT NOT NULL,

    CONSTRAINT "CertificationsOnProduct_pkey" PRIMARY KEY ("product_id","certification_id")
);

-- AddForeignKey
ALTER TABLE "FAQsOnProduct" ADD CONSTRAINT "FAQsOnProduct_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQsOnProduct" ADD CONSTRAINT "FAQsOnProduct_faq_id_fkey" FOREIGN KEY ("faq_id") REFERENCES "FAQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationsOnProduct" ADD CONSTRAINT "CertificationsOnProduct_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationsOnProduct" ADD CONSTRAINT "CertificationsOnProduct_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "Certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
