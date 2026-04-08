-- CreateEnum
CREATE TYPE "CursoStatus" AS ENUM ('activo', 'inactivo');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CANCELLED', 'COMPLETED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'POS', 'ONLINE', 'YAPE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "RoleAccess" AS ENUM ('SALES_REP', 'MARKETING', 'SALES_SUPERVISOR', 'ADMIN', 'COLLECTIONS');

-- CreateEnum
CREATE TYPE "CampaingStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "EditionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'OPEN', 'SCHEDULED', 'DRAFT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SalesStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ON_SALE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CampaingPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'WEBSITE');

-- CreateEnum
CREATE TYPE "LeadOriginSource" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'WHATSAPP', 'WEBSITE');

-- CreateEnum
CREATE TYPE "CampaignMemberStatus" AS ENUM ('NEW', 'CONTACTED', 'ATTEMPTED_CONTACT', 'QUALIFIED', 'UNQUALIFIED', 'IN_PROGRESS', 'NEGOTIATION', 'PROPOSAL_SENT', 'WON', 'LOST', 'REJECTED', 'FOLLOW_UP', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "PhoneType" AS ENUM ('WHATSAPP', 'TELEPHONE');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('PROSPECT');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('WEBSITE_FORM', 'SELL', 'WHATSAPP', 'EMAIL', 'MEETING', 'CALL');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('FULL', 'INSTALLMENTS');

-- CreateEnum
CREATE TYPE "PaymentPlanStatus" AS ENUM ('COMPLETED', 'PENDING', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PARTIALLY_PAID', 'PAID', 'OVERDUE', 'PENDING');

-- CreateTable
CREATE TABLE "Role" (
    "id" CHAR(36) NOT NULL,
    "name" "RoleAccess" NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerProfile" (
    "id" CHAR(36) NOT NULL,
    "user_id" TEXT NOT NULL,
    "sales_target" INTEGER NOT NULL DEFAULT 0,
    "max_discount" DECIMAL(65,30) DEFAULT 0,

    CONSTRAINT "SellerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingProfile" (
    "id" CHAR(36) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "MarketingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" CHAR(36) NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "cellphone" CHAR(9),
    "role_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadPhone" (
    "id" CHAR(36) NOT NULL,
    "number" TEXT NOT NULL,
    "type" "PhoneType" NOT NULL,
    "lead_id" TEXT NOT NULL,

    CONSTRAINT "LeadPhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaingMember" (
    "id" CHAR(36) NOT NULL,
    "lead_id" TEXT NOT NULL,
    "campaing_id" TEXT NOT NULL,
    "status" "CampaignMemberStatus" NOT NULL DEFAULT 'NEW',
    "assigned_to" TEXT,
    "source" "LeadOriginSource" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CampaingMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" CHAR(36) NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "profession" TEXT,
    "gender" "Gender",
    "address" TEXT,
    "second_address" TEXT,
    "email" TEXT NOT NULL,
    "secondary_email" TEXT,
    "dni" CHAR(8),
    "moodle_user_id" INTEGER,
    "lead_status" "LeadStatus" NOT NULL DEFAULT 'ACTIVE',
    "primary_campaign_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadInteraction" (
    "id" CHAR(36) NOT NULL,
    "lead_id" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "created_by" TEXT,
    "campaing_id" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,

    CONSTRAINT "LeadInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tasks" (
    "id" CHAR(36) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "code" CHAR(7) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaing" (
    "id" CHAR(36) NOT NULL,
    "campaing_name" TEXT NOT NULL,
    "initial_budget" DECIMAL(10,2) NOT NULL,
    "total_spent" DECIMAL(10,2),
    "status" "CampaingStatus" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "platform" "CampaingPlatform" NOT NULL,
    "is_organic" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "edition_id" TEXT NOT NULL,

    CONSTRAINT "Campaing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modality" (
    "id" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Modality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edition" (
    "id" CHAR(36) NOT NULL,
    "course_id" TEXT NOT NULL,
    "edition_number" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "modality_id" TEXT NOT NULL,
    "moodle_course_id" INTEGER,
    "teacher_fullname" TEXT NOT NULL,
    "meet_link" TEXT NOT NULL,
    "edition_status" "EditionStatus" NOT NULL DEFAULT 'DRAFT',
    "edition_code" CHAR(12) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Edition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" CHAR(36) NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "short_description" TEXT,
    "category" TEXT NOT NULL,
    "edition_id" TEXT NOT NULL,
    "cash_price" DECIMAL(10,2) NOT NULL,
    "installment_price" DECIMAL(10,2) NOT NULL,
    "discount_price" DECIMAL(10,2) DEFAULT 0,
    "discount_expires_at" TIMESTAMP(3),
    "sales_status" "SalesStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" CHAR(36) NOT NULL,
    "lead_id" TEXT NOT NULL,
    "generated_by" TEXT,
    "sub_total" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "order_status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "order_code" CHAR(7) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderDetail" (
    "id" CHAR(36) NOT NULL,
    "product_id" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "order_id" TEXT NOT NULL,
    "discount_code" CHAR(7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" CHAR(36) NOT NULL,
    "order_id" TEXT NOT NULL,
    "scheduled_payment_id" TEXT,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL,
    "type" "PaymentType" NOT NULL,
    "currency" CHAR(3),
    "transaccion_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentPlan" (
    "id" CHAR(36) NOT NULL,
    "total_installments" INTEGER NOT NULL,
    "order_id" TEXT NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "status" "PaymentPlanStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "PaymentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledPayment" (
    "id" CHAR(36) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "due_amount" DECIMAL(10,2) NOT NULL,
    "payment_plan_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 1,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_user_id_key" ON "SellerProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingProfile_user_id_key" ON "MarketingProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "CampaingMember_status_idx" ON "CampaingMember"("status");

-- CreateIndex
CREATE INDEX "CampaingMember_assigned_to_idx" ON "CampaingMember"("assigned_to");

-- CreateIndex
CREATE UNIQUE INDEX "CampaingMember_lead_id_campaing_id_key" ON "CampaingMember"("lead_id", "campaing_id");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_dni_key" ON "Lead"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_moodle_user_id_key" ON "Lead"("moodle_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Campaing_edition_id_key" ON "Campaing"("edition_id");

-- CreateIndex
CREATE UNIQUE INDEX "Modality_name_key" ON "Modality"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Edition_moodle_course_id_key" ON "Edition"("moodle_course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Edition_edition_code_key" ON "Edition"("edition_code");

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_code_key" ON "Order"("order_code");

-- CreateIndex
CREATE INDEX "Order_lead_id_idx" ON "Order"("lead_id");

-- CreateIndex
CREATE INDEX "Order_order_status_idx" ON "Order"("order_status");

-- CreateIndex
CREATE INDEX "Payment_payment_status_idx" ON "Payment"("payment_status");

-- CreateIndex
CREATE INDEX "PaymentPlan_order_id_idx" ON "PaymentPlan"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledPayment_payment_plan_id_number_key" ON "ScheduledPayment"("payment_plan_id", "number");

-- AddForeignKey
ALTER TABLE "SellerProfile" ADD CONSTRAINT "SellerProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingProfile" ADD CONSTRAINT "MarketingProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadPhone" ADD CONSTRAINT "LeadPhone_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaingMember" ADD CONSTRAINT "CampaingMember_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaingMember" ADD CONSTRAINT "CampaingMember_campaing_id_fkey" FOREIGN KEY ("campaing_id") REFERENCES "Campaing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaingMember" ADD CONSTRAINT "CampaingMember_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "SellerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_primary_campaign_id_fkey" FOREIGN KEY ("primary_campaign_id") REFERENCES "Campaing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadInteraction" ADD CONSTRAINT "LeadInteraction_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadInteraction" ADD CONSTRAINT "LeadInteraction_campaing_id_fkey" FOREIGN KEY ("campaing_id") REFERENCES "CampaingMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadInteraction" ADD CONSTRAINT "LeadInteraction_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "SellerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaing" ADD CONSTRAINT "Campaing_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "Edition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edition" ADD CONSTRAINT "Edition_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edition" ADD CONSTRAINT "Edition_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "Modality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "Edition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "SellerProfile"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_scheduled_payment_id_fkey" FOREIGN KEY ("scheduled_payment_id") REFERENCES "ScheduledPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPlan" ADD CONSTRAINT "PaymentPlan_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPayment" ADD CONSTRAINT "ScheduledPayment_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "PaymentPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
