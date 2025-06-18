/*
  Warnings:

  - You are about to drop the column `category` on the `Note` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Note" ADD COLUMN "categories" TEXT[];
UPDATE "Note" SET "categories" = ARRAY["category"] WHERE "category" IS NOT NULL;
ALTER TABLE "Note" DROP COLUMN "category";
