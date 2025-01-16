/*
  Warnings:

  - You are about to drop the column `numOfReadingPages` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "numOfReadingPages" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "numOfReadingPages";
