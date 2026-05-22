-- CreateEnum
CREATE TYPE "CampusStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "DictionaryCategory" AS ENUM ('SCHOOL', 'MAJOR', 'EXAM_TRACK', 'LEAD_SOURCE', 'QUESTION_TYPE', 'DIFFICULTY', 'CLASS_TYPE');

-- AlterTable
ALTER TABLE "Campus" ADD COLUMN "managerId" TEXT,
ADD COLUMN "contactPhone" TEXT,
ADD COLUMN "status" "CampusStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "BusinessDictionary" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "category" "DictionaryCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessDictionary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Campus_managerId_idx" ON "Campus"("managerId");

-- CreateIndex
CREATE INDEX "Campus_status_idx" ON "Campus"("status");

-- CreateIndex
CREATE INDEX "BusinessDictionary_organizationId_category_idx" ON "BusinessDictionary"("organizationId", "category");

-- CreateIndex
CREATE INDEX "BusinessDictionary_enabled_idx" ON "BusinessDictionary"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessDictionary_organizationId_category_name_key" ON "BusinessDictionary"("organizationId", "category", "name");

-- AddForeignKey
ALTER TABLE "Campus" ADD CONSTRAINT "Campus_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessDictionary" ADD CONSTRAINT "BusinessDictionary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
