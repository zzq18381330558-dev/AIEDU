-- CreateEnum
CREATE TYPE "CampusBusinessType" AS ENUM ('DIRECT', 'FRANCHISE');

-- AlterTable
ALTER TABLE "Campus" ADD COLUMN "businessType" "CampusBusinessType" NOT NULL DEFAULT 'DIRECT';

-- CreateIndex
CREATE INDEX "Campus_businessType_idx" ON "Campus"("businessType");
