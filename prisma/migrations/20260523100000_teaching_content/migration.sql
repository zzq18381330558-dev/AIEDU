-- CreateEnum
CREATE TYPE "TeachingContentType" AS ENUM ('COURSE_HANDOUT', 'PPT_OUTLINE', 'REAL_EXAM_ANALYSIS', 'MOCK_PAPER', 'WRITING_TEMPLATE', 'INTERVIEW_STRUCTURED_TEMPLATE', 'SHORT_VIDEO_SCRIPT', 'SALES_MOMENTS_COPY', 'SALES_POSTER_COPY');

-- CreateEnum
CREATE TYPE "ContentReviewAction" AS ENUM ('SUBMIT', 'APPROVE', 'REJECT', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "ContentExportFormat" AS ENUM ('WORD', 'PDF');

-- AlterEnum
ALTER TYPE "ContentStatus" ADD VALUE IF NOT EXISTS 'APPROVED';

-- AlterTable
ALTER TABLE "TeachingContent" ADD COLUMN "type" "TeachingContentType" NOT NULL DEFAULT 'COURSE_HANDOUT';
ALTER TABLE "TeachingContent" ADD COLUMN "summary" TEXT;
ALTER TABLE "TeachingContent" ADD COLUMN "currentVersion" INTEGER NOT NULL DEFAULT 1;

UPDATE "TeachingContent"
SET "type" = CASE
  WHEN "category" LIKE '%PPT%' THEN 'PPT_OUTLINE'::"TeachingContentType"
  WHEN "category" LIKE '%真题%' THEN 'REAL_EXAM_ANALYSIS'::"TeachingContentType"
  WHEN "category" LIKE '%作文%' THEN 'WRITING_TEMPLATE'::"TeachingContentType"
  ELSE 'COURSE_HANDOUT'::"TeachingContentType"
END;

ALTER TABLE "TeachingContent" ALTER COLUMN "type" DROP DEFAULT;

-- CreateTable
CREATE TABLE "TeachingContentVersion" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "changeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeachingContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingContentReview" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "action" "ContentReviewAction" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeachingContentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingContentPublication" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeachingContentPublication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingContentExport" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "format" "ContentExportFormat" NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeachingContentExport_pkey" PRIMARY KEY ("id")
);

INSERT INTO "TeachingContentVersion" ("id", "contentId", "version", "title", "body", "changeNote")
SELECT concat('version-', "id", '-1'), "id", 1, "title", COALESCE("body", ''), '初始化版本'
FROM "TeachingContent";

-- CreateIndex
CREATE INDEX "TeachingContent_type_idx" ON "TeachingContent"("type");
CREATE INDEX "TeachingContent_category_idx" ON "TeachingContent"("category");
CREATE UNIQUE INDEX "TeachingContentVersion_contentId_version_key" ON "TeachingContentVersion"("contentId", "version");
CREATE INDEX "TeachingContentVersion_contentId_idx" ON "TeachingContentVersion"("contentId");
CREATE INDEX "TeachingContentReview_contentId_idx" ON "TeachingContentReview"("contentId");
CREATE INDEX "TeachingContentReview_reviewerId_idx" ON "TeachingContentReview"("reviewerId");
CREATE INDEX "TeachingContentReview_action_idx" ON "TeachingContentReview"("action");
CREATE UNIQUE INDEX "TeachingContentPublication_contentId_campusId_key" ON "TeachingContentPublication"("contentId", "campusId");
CREATE INDEX "TeachingContentPublication_campusId_idx" ON "TeachingContentPublication"("campusId");
CREATE INDEX "TeachingContentExport_contentId_idx" ON "TeachingContentExport"("contentId");
CREATE INDEX "TeachingContentExport_format_idx" ON "TeachingContentExport"("format");

-- AddForeignKey
ALTER TABLE "TeachingContentVersion" ADD CONSTRAINT "TeachingContentVersion_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "TeachingContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeachingContentReview" ADD CONSTRAINT "TeachingContentReview_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "TeachingContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeachingContentReview" ADD CONSTRAINT "TeachingContentReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TeachingContentPublication" ADD CONSTRAINT "TeachingContentPublication_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "TeachingContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeachingContentPublication" ADD CONSTRAINT "TeachingContentPublication_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TeachingContentExport" ADD CONSTRAINT "TeachingContentExport_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "TeachingContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
