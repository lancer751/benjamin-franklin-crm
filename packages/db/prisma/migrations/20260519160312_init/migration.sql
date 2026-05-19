/*
  Warnings:

  - A unique constraint covering the columns `[edition_number,edition_code]` on the table `Edition` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Edition_edition_code_key";

-- CreateIndex
CREATE UNIQUE INDEX "Edition_edition_number_edition_code_key" ON "Edition"("edition_number", "edition_code");
