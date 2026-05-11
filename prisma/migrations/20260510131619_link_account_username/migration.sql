/*
  Warnings:

  - You are about to drop the column `accessToken` on the `LinkedAccount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LinkedAccount" DROP COLUMN "accessToken",
ADD COLUMN     "providerUsername" TEXT;
