-- Course center data model and compatibility backfill.

CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'DISABLED');

CREATE TABLE "Course" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "campusId" TEXT,
  "createdById" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "examTrack" "LeadExamTrack" NOT NULL DEFAULT 'PRIMARY',
  "category" TEXT NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseChapter" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CourseChapter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseLesson" (
  "id" TEXT NOT NULL,
  "chapterId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "durationMinutes" INTEGER NOT NULL DEFAULT 0,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "teachingContentId" TEXT,
  "questionPaperId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CourseLesson_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "StudentClass" ADD COLUMN "courseId" TEXT;

WITH creator AS (
  SELECT DISTINCT ON ("organizationId")
    "organizationId",
    "id" AS "createdById"
  FROM "User"
  ORDER BY "organizationId", ("role" = 'ADMIN') DESC, "createdAt" ASC
)
INSERT INTO "Course" (
  "id",
  "organizationId",
  "campusId",
  "createdById",
  "name",
  "code",
  "description",
  "examTrack",
  "category",
  "price",
  "status",
  "isPublished",
  "updatedAt"
)
SELECT
  'seed-course-campus-' || c."id",
  c."organizationId",
  c."id",
  creator."createdById",
  c."name" || '默认课程',
  'DEFAULT-' || c."code",
  'V0.7 课程中心迁移为历史班级创建的默认课程。',
  'PRIMARY',
  '默认课程',
  0,
  'ACTIVE',
  false,
  CURRENT_TIMESTAMP
FROM "Campus" c
JOIN creator ON creator."organizationId" = c."organizationId"
ON CONFLICT DO NOTHING;

WITH creator AS (
  SELECT DISTINCT ON ("organizationId")
    "organizationId",
    "id" AS "createdById"
  FROM "User"
  ORDER BY "organizationId", ("role" = 'ADMIN') DESC, "createdAt" ASC
)
INSERT INTO "Course" (
  "id",
  "organizationId",
  "campusId",
  "createdById",
  "name",
  "code",
  "description",
  "examTrack",
  "category",
  "price",
  "status",
  "isPublished",
  "updatedAt"
)
SELECT
  'seed-course-hq-' || o."id",
  o."id",
  NULL,
  creator."createdById",
  '总部标准课程',
  'HQ-DEFAULT',
  '总部课程模板，可作为后续校区课程建设参考。',
  'PRIMARY',
  '总部课程',
  0,
  'ACTIVE',
  false,
  CURRENT_TIMESTAMP
FROM "Organization" o
JOIN creator ON creator."organizationId" = o."id"
ON CONFLICT DO NOTHING;

UPDATE "StudentClass" sc
SET "courseId" = course."id"
FROM "Campus" c
JOIN "Course" course ON course."campusId" = c."id" AND course."code" = 'DEFAULT-' || c."code"
WHERE sc."campusId" = c."id";

ALTER TABLE "StudentClass" ALTER COLUMN "courseId" SET NOT NULL;

CREATE UNIQUE INDEX "Course_organizationId_code_key" ON "Course"("organizationId", "code");
CREATE INDEX "Course_organizationId_idx" ON "Course"("organizationId");
CREATE INDEX "Course_campusId_idx" ON "Course"("campusId");
CREATE INDEX "Course_createdById_idx" ON "Course"("createdById");
CREATE INDEX "Course_examTrack_idx" ON "Course"("examTrack");
CREATE INDEX "Course_status_idx" ON "Course"("status");
CREATE INDEX "Course_isPublished_idx" ON "Course"("isPublished");
CREATE INDEX "Course_deletedAt_idx" ON "Course"("deletedAt");
CREATE INDEX "CourseChapter_courseId_idx" ON "CourseChapter"("courseId");
CREATE INDEX "CourseChapter_sortOrder_idx" ON "CourseChapter"("sortOrder");
CREATE INDEX "CourseLesson_chapterId_idx" ON "CourseLesson"("chapterId");
CREATE INDEX "CourseLesson_teachingContentId_idx" ON "CourseLesson"("teachingContentId");
CREATE INDEX "CourseLesson_questionPaperId_idx" ON "CourseLesson"("questionPaperId");
CREATE INDEX "CourseLesson_sortOrder_idx" ON "CourseLesson"("sortOrder");
CREATE INDEX "StudentClass_courseId_idx" ON "StudentClass"("courseId");

ALTER TABLE "Course" ADD CONSTRAINT "Course_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Course" ADD CONSTRAINT "Course_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Course" ADD CONSTRAINT "Course_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CourseChapter" ADD CONSTRAINT "CourseChapter_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "CourseChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_teachingContentId_fkey" FOREIGN KEY ("teachingContentId") REFERENCES "TeachingContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_questionPaperId_fkey" FOREIGN KEY ("questionPaperId") REFERENCES "ExamPaper"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudentClass" ADD CONSTRAINT "StudentClass_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "RolePermission" ("id", "role", "module", "enabled", "updatedAt")
VALUES
  ('course-permission-campus-manager', 'CAMPUS_MANAGER', 'courses', true, CURRENT_TIMESTAMP),
  ('course-permission-admissions-counselor', 'ADMISSIONS_COUNSELOR', 'courses', false, CURRENT_TIMESTAMP),
  ('course-permission-academic-teacher', 'ACADEMIC_TEACHER', 'courses', true, CURRENT_TIMESTAMP),
  ('course-permission-lecturer', 'LECTURER', 'courses', true, CURRENT_TIMESTAMP)
ON CONFLICT ("role", "module") DO UPDATE
SET "enabled" = EXCLUDED."enabled", "updatedAt" = CURRENT_TIMESTAMP;
