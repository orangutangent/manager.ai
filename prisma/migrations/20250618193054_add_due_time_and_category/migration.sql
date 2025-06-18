/*
  Warnings:

  - Added the required column `category` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Без категории';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "dueTime" TIMESTAMP(3);
