/*
  Warnings:

  - You are about to drop the column `arifPayRef` on the `Swap` table. All the data in the column will be lost.
  - You are about to drop the column `arifPayStatus` on the `Swap` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Swap" DROP COLUMN "arifPayRef",
DROP COLUMN "arifPayStatus",
ADD COLUMN     "chapaRef" TEXT,
ADD COLUMN     "chapaStatus" TEXT;
