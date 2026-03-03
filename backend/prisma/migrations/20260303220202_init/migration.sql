/*
  Warnings:

  - You are about to alter the column `metodo_pago` on the `pago` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - A unique constraint covering the columns `[numero_order]` on the table `Compra` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numero_order` to the `Compra` table without a default value. This is not possible if the table is not empty.
  - Made the column `fecha_pago` on table `pago` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `compra` ADD COLUMN `numero_order` CHAR(10) NOT NULL;

-- AlterTable
ALTER TABLE `pago` MODIFY `fecha_pago` DATETIME(3) NOT NULL,
    MODIFY `metodo_pago` ENUM('efectivo', 'transferencia', 'pos', 'online', 'yape') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Compra_numero_order_key` ON `Compra`(`numero_order`);
