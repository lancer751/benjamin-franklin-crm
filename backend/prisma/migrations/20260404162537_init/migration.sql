-- CreateTable
CREATE TABLE `Role` (
    `id` CHAR(36) NOT NULL,
    `name` ENUM('SALES_REP', 'MARKETING', 'SALES_SUPERVISOR', 'ADMIN', 'COLLECTIONS') NOT NULL,
    `description` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SellerProfile` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `sales_target` INTEGER NOT NULL DEFAULT 0,
    `max_discount` DECIMAL(65, 30) NULL DEFAULT 0,

    UNIQUE INDEX `SellerProfile_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MarketingProfile` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `MarketingProfile_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` CHAR(36) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `middle_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `cellphone` CHAR(9) NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `password` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeadPhone` (
    `id` CHAR(36) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `type` ENUM('WHATSAPP', 'TELEPHONE') NOT NULL,
    `lead_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampaingMember` (
    `id` CHAR(36) NOT NULL,
    `lead_id` VARCHAR(191) NOT NULL,
    `campaing_id` VARCHAR(191) NOT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'ATTEMPTED_CONTACT', 'QUALIFIED', 'UNQUALIFIED', 'IN_PROGRESS', 'NEGOTIATION', 'PROPOSAL_SENT', 'WON', 'LOST', 'REJECTED', 'FOLLOW_UP', 'ON_HOLD') NOT NULL DEFAULT 'NEW',
    `assigned_to` VARCHAR(191) NULL,
    `source` ENUM('FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'WHATSAPP', 'WEBSITE') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,

    INDEX `CampaingMember_status_idx`(`status`),
    INDEX `CampaingMember_assigned_to_idx`(`assigned_to`),
    UNIQUE INDEX `CampaingMember_lead_id_campaing_id_key`(`lead_id`, `campaing_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lead` (
    `id` CHAR(36) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `middle_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `profession` VARCHAR(191) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'NOT_SPECIFIED') NULL,
    `address` VARCHAR(191) NULL,
    `second_address` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `secondary_email` VARCHAR(191) NULL,
    `dni` CHAR(8) NULL,
    `moodle_user_id` INTEGER NULL,
    `lead_status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `primary_campaign_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Lead_email_key`(`email`),
    UNIQUE INDEX `Lead_dni_key`(`dni`),
    UNIQUE INDEX `Lead_moodle_user_id_key`(`moodle_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeadInteraction` (
    `id` CHAR(36) NOT NULL,
    `lead_id` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NOT NULL,
    `created_by` VARCHAR(191) NULL,
    `campaing_id` VARCHAR(191) NOT NULL,
    `type` ENUM('WEBSITE_FORM', 'SELL', 'WHATSAPP', 'EMAIL', 'MEETING', 'CALL') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tasks` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` MEDIUMTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Course` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NULL,
    `code` CHAR(7) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campaing` (
    `id` CHAR(36) NOT NULL,
    `campaing_name` VARCHAR(191) NOT NULL,
    `initial_budget` DECIMAL(10, 2) NOT NULL,
    `total_spent` DECIMAL(10, 2) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'PAUSED') NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `platform` ENUM('FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'WEBSITE') NOT NULL,
    `is_organic` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `edition_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Campaing_edition_id_key`(`edition_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Modality` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Modality_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Edition` (
    `id` CHAR(36) NOT NULL,
    `course_id` VARCHAR(191) NOT NULL,
    `edition_number` INTEGER NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `modality_id` VARCHAR(191) NOT NULL,
    `moodle_course_id` INTEGER NULL,
    `teacher_fullname` VARCHAR(191) NOT NULL,
    `meet_link` VARCHAR(191) NOT NULL,
    `edition_status` ENUM('IN_PROGRESS', 'COMPLETED', 'OPEN', 'SCHEDULED', 'DRAFT', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `edition_code` CHAR(12) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Edition_moodle_course_id_key`(`moodle_course_id`),
    UNIQUE INDEX `Edition_edition_code_key`(`edition_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` CHAR(36) NOT NULL,
    `slug` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `short_description` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL,
    `edition_id` VARCHAR(191) NOT NULL,
    `cash_price` DECIMAL(10, 2) NOT NULL,
    `installment_price` DECIMAL(10, 2) NOT NULL,
    `discount_price` DECIMAL(10, 2) NULL DEFAULT 0,
    `discount_expires_at` DATETIME(3) NULL,
    `sales_status` ENUM('DRAFT', 'PUBLISHED', 'ON_SALE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` CHAR(36) NOT NULL,
    `lead_id` VARCHAR(191) NOT NULL,
    `generated_by` VARCHAR(191) NULL,
    `sub_total` DECIMAL(10, 2) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `discount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `order_status` ENUM('PENDING', 'CANCELLED', 'COMPLETED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `order_code` CHAR(7) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_order_code_key`(`order_code`),
    INDEX `Order_lead_id_idx`(`lead_id`),
    INDEX `Order_order_status_idx`(`order_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderDetail` (
    `id` CHAR(36) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `discount_code` CHAR(7) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` CHAR(36) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `scheduled_payment_id` VARCHAR(191) NULL,
    `payment_date` DATETIME(3) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` ENUM('CASH', 'BANK_TRANSFER', 'POS', 'ONLINE', 'YAPE') NOT NULL,
    `payment_status` ENUM('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED') NOT NULL,
    `type` ENUM('FULL', 'INSTALLMENTS') NOT NULL,
    `currency` CHAR(3) NULL,
    `transaccion_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Payment_payment_status_idx`(`payment_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentPlan` (
    `id` CHAR(36) NOT NULL,
    `total_installments` INTEGER NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `status` ENUM('COMPLETED', 'PENDING', 'CANCELLED') NOT NULL DEFAULT 'PENDING',

    INDEX `PaymentPlan_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScheduledPayment` (
    `id` CHAR(36) NOT NULL,
    `due_date` DATETIME(3) NOT NULL,
    `due_amount` DECIMAL(10, 2) NOT NULL,
    `payment_plan_id` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('PARTIALLY_PAID', 'PAID', 'OVERDUE', 'PENDING') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ScheduledPayment_payment_plan_id_number_key`(`payment_plan_id`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SellerProfile` ADD CONSTRAINT `SellerProfile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarketingProfile` ADD CONSTRAINT `MarketingProfile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeadPhone` ADD CONSTRAINT `LeadPhone_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `Lead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaingMember` ADD CONSTRAINT `CampaingMember_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `Lead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaingMember` ADD CONSTRAINT `CampaingMember_campaing_id_fkey` FOREIGN KEY (`campaing_id`) REFERENCES `Campaing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaingMember` ADD CONSTRAINT `CampaingMember_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `SellerProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_primary_campaign_id_fkey` FOREIGN KEY (`primary_campaign_id`) REFERENCES `Campaing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeadInteraction` ADD CONSTRAINT `LeadInteraction_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `Lead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeadInteraction` ADD CONSTRAINT `LeadInteraction_campaing_id_fkey` FOREIGN KEY (`campaing_id`) REFERENCES `CampaingMember`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeadInteraction` ADD CONSTRAINT `LeadInteraction_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `SellerProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaing` ADD CONSTRAINT `Campaing_edition_id_fkey` FOREIGN KEY (`edition_id`) REFERENCES `Edition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Edition` ADD CONSTRAINT `Edition_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Edition` ADD CONSTRAINT `Edition_modality_id_fkey` FOREIGN KEY (`modality_id`) REFERENCES `Modality`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_edition_id_fkey` FOREIGN KEY (`edition_id`) REFERENCES `Edition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `Lead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_generated_by_fkey` FOREIGN KEY (`generated_by`) REFERENCES `SellerProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetail` ADD CONSTRAINT `OrderDetail_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetail` ADD CONSTRAINT `OrderDetail_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_scheduled_payment_id_fkey` FOREIGN KEY (`scheduled_payment_id`) REFERENCES `ScheduledPayment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentPlan` ADD CONSTRAINT `PaymentPlan_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduledPayment` ADD CONSTRAINT `ScheduledPayment_payment_plan_id_fkey` FOREIGN KEY (`payment_plan_id`) REFERENCES `PaymentPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
