-- DropForeignKey
ALTER TABLE "SellerProfile" DROP CONSTRAINT "SellerProfile_assigned_supervisor_id_fkey";

-- AddForeignKey
ALTER TABLE "SellerProfile" ADD CONSTRAINT "SellerProfile_assigned_supervisor_id_fkey" FOREIGN KEY ("assigned_supervisor_id") REFERENCES "SalesSupervisorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
