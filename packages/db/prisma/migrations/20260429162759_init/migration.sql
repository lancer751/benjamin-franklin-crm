-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "assigned_supervisor_id" TEXT;

-- CreateTable
CREATE TABLE "SalesSupervisorProfile" (
    "id" CHAR(36) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "SalesSupervisorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesSupervisorProfile_user_id_key" ON "SalesSupervisorProfile"("user_id");

-- AddForeignKey
ALTER TABLE "SellerProfile" ADD CONSTRAINT "SellerProfile_assigned_supervisor_id_fkey" FOREIGN KEY ("assigned_supervisor_id") REFERENCES "SalesSupervisorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesSupervisorProfile" ADD CONSTRAINT "SalesSupervisorProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
