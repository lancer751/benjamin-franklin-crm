/*
  Warnings:

  - You are about to drop the column `createdAt` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `role` table. All the data in the column will be lost.
  - You are about to drop the `cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `compra` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `curso` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `detallecompra` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `edicion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `matricula` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `modalidad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pago` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `producto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `compra` DROP FOREIGN KEY `Compra_cliente_id_fkey`;

-- DropForeignKey
ALTER TABLE `compra` DROP FOREIGN KEY `Compra_vendedor_id_fkey`;

-- DropForeignKey
ALTER TABLE `detallecompra` DROP FOREIGN KEY `DetalleCompra_compra_id_fkey`;

-- DropForeignKey
ALTER TABLE `detallecompra` DROP FOREIGN KEY `DetalleCompra_producto_id_fkey`;

-- DropForeignKey
ALTER TABLE `edicion` DROP FOREIGN KEY `Edicion_curso_id_fkey`;

-- DropForeignKey
ALTER TABLE `edicion` DROP FOREIGN KEY `Edicion_modalidad_id_fkey`;

-- DropForeignKey
ALTER TABLE `matricula` DROP FOREIGN KEY `Matricula_cliente_id_fkey`;

-- DropForeignKey
ALTER TABLE `matricula` DROP FOREIGN KEY `Matricula_edicion_id_fkey`;

-- DropForeignKey
ALTER TABLE `pago` DROP FOREIGN KEY `Pago_orden_id_fkey`;

-- DropForeignKey
ALTER TABLE `producto` DROP FOREIGN KEY `Producto_edicion_id_fkey`;

-- DropForeignKey
ALTER TABLE `usuario` DROP FOREIGN KEY `Usuario_role_id_fkey`;

-- DropIndex
DROP INDEX `Role_nombre_key` ON `role`;

-- AlterTable
ALTER TABLE `role` DROP COLUMN `createdAt`,
    DROP COLUMN `descripcion`,
    DROP COLUMN `nombre`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `name` ENUM('SALES_REP', 'MARKETING', 'SALES_SUPERVISOR', 'ADMIN', 'COLLECTIONS') NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `cliente`;

-- DropTable
DROP TABLE `compra`;

-- DropTable
DROP TABLE `curso`;

-- DropTable
DROP TABLE `detallecompra`;

-- DropTable
DROP TABLE `edicion`;

-- DropTable
DROP TABLE `matricula`;

-- DropTable
DROP TABLE `modalidad`;

-- DropTable
DROP TABLE `pago`;

-- DropTable
DROP TABLE `producto`;

-- DropTable
DROP TABLE `usuario`;

-- CreateTable
CREATE TABLE `SellerProfile` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `sales_target` INTEGER NOT NULL,
    `sales_closed` INTEGER NULL,
    `max_discount` DECIMAL(65, 30) NOT NULL,

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
    `email` VARCHAR(191) NOT NULL,
    `cellphone` CHAR(9) NOT NULL,
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
    `assigned_seller_id` VARCHAR(191) NULL,
    `lead_status` ENUM('NEW', 'CONTACTED', 'ATTEMPTED_CONTACT', 'QUALIFIED', 'UNQUALIFIED', 'IN_PROGRESS', 'NEGOTIATION', 'PROPOSAL_SENT', 'WON', 'LOST', 'REJECTED', 'FOLLOW_UP', 'ON_HOLD') NOT NULL DEFAULT 'NEW',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Lead_email_key`(`email`),
    UNIQUE INDEX `Lead_dni_key`(`dni`),
    UNIQUE INDEX `Lead_moodle_user_id_key`(`moodle_user_id`),
    INDEX `Lead_assigned_seller_id_idx`(`assigned_seller_id`),
    INDEX `Lead_lead_status_idx`(`lead_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lead_Interactions` (
    `id` CHAR(36) NOT NULL,
    `lead_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tasks` (
    `id` CHAR(36) NOT NULL,

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
    `start_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `end_date` DATETIME(3) NULL,
    `platform` ENUM('FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'TELEGRAM') NOT NULL,
    `is_organic` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Modality` (
    `id` CHAR(36) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Modality_nombre_key`(`nombre`),
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
    `edition_code` CHAR(7) NOT NULL,
    `campaign_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Edition_moodle_course_id_key`(`moodle_course_id`),
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
    `price` DECIMAL(10, 2) NOT NULL,
    `discount_price` DECIMAL(10, 2) NULL,
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
    `discount_code` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` CHAR(36) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `payment_date` DATETIME(3) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` ENUM('CASH', 'BANK_TRANSFER', 'POS', 'ONLINE', 'YAPE') NOT NULL,
    `payment_status` ENUM('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED') NOT NULL,
    `currency` CHAR(3) NULL,
    `transaccion_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Payment_order_id_idx`(`order_id`),
    INDEX `Payment_payment_status_idx`(`payment_status`),
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
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_assigned_seller_id_fkey` FOREIGN KEY (`assigned_seller_id`) REFERENCES `SellerProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead_Interactions` ADD CONSTRAINT `Lead_Interactions_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `Lead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Edition` ADD CONSTRAINT `Edition_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Edition` ADD CONSTRAINT `Edition_modality_id_fkey` FOREIGN KEY (`modality_id`) REFERENCES `Modality`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Edition` ADD CONSTRAINT `Edition_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `Campaing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
