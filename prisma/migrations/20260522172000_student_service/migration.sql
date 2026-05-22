-- CreateEnum
CREATE TYPE "StudentStudyStatus" AS ENUM ('NOT_STARTED', 'STUDYING', 'PAUSED', 'COMPLETED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CourseSessionType" AS ENUM ('LIVE', 'RECORDED', 'PRACTICE', 'MOCK_EXAM');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'LEAVE');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('CLASS', 'HOMEWORK', 'CHECK_IN', 'ABSENCE', 'EXAM', 'STUDY_PLAN');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "StudentClass" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "academicOwnerId" TEXT,
    "lecturerId" TEXT,
    "classType" TEXT,
    "examTrack" "LeadExamTrack" NOT NULL DEFAULT 'PRIMARY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseSession" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "lecturerId" TEXT,
    "title" TEXT NOT NULL,
    "type" "CourseSessionType" NOT NULL DEFAULT 'LIVE',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "room" TEXT,
    "homework" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseSessionId" TEXT NOT NULL,
    "recorderId" TEXT,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "checkInAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentReminder" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "classId" TEXT,
    "courseSessionId" TEXT,
    "creatorId" TEXT,
    "type" "ReminderType" NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "pushedAt" TIMESTAMP(3),
    "channel" TEXT NOT NULL DEFAULT 'WECHAT_RESERVED',
    "provider" TEXT NOT NULL DEFAULT 'OPENCLAW_RESERVED',
    "providerPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentReminder_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Student" ADD COLUMN "classId" TEXT;
ALTER TABLE "Student" ADD COLUMN "academicOwnerId" TEXT;
ALTER TABLE "Student" ADD COLUMN "salesOwnerId" TEXT;
ALTER TABLE "Student" ADD COLUMN "grade" TEXT;
ALTER TABLE "Student" ADD COLUMN "classType" TEXT;
ALTER TABLE "Student" ADD COLUMN "studyStatus" "StudentStudyStatus" NOT NULL DEFAULT 'NOT_STARTED';
ALTER TABLE "Student" ADD COLUMN "serviceNote" TEXT;

ALTER TABLE "Student" ALTER COLUMN "examTrack" TYPE "LeadExamTrack" USING (
  CASE
    WHEN lower("examTrack") LIKE '%幼%' THEN 'INFANT'
    WHEN lower("examTrack") LIKE '%中%' THEN 'MIDDLE'
    ELSE 'PRIMARY'
  END
)::"LeadExamTrack";
ALTER TABLE "Student" ALTER COLUMN "examTrack" SET DEFAULT 'PRIMARY';

UPDATE "Student"
SET
  "salesOwnerId" = "Lead"."assigneeId",
  "school" = COALESCE("Student"."school", "Lead"."school"),
  "grade" = "Lead"."grade",
  "major" = COALESCE("Student"."major", "Lead"."major")
FROM "Lead"
WHERE "Student"."leadId" = "Lead"."id";

-- AlterTable
ALTER TABLE "StudyPlan" ADD COLUMN "planText" TEXT;
ALTER TABLE "StudyPlan" ADD COLUMN "serviceScript" TEXT;

-- CreateIndex
CREATE INDEX "StudentClass_campusId_idx" ON "StudentClass"("campusId");
CREATE INDEX "StudentClass_academicOwnerId_idx" ON "StudentClass"("academicOwnerId");
CREATE INDEX "StudentClass_lecturerId_idx" ON "StudentClass"("lecturerId");
CREATE INDEX "CourseSession_campusId_idx" ON "CourseSession"("campusId");
CREATE INDEX "CourseSession_classId_idx" ON "CourseSession"("classId");
CREATE INDEX "CourseSession_lecturerId_idx" ON "CourseSession"("lecturerId");
CREATE INDEX "CourseSession_startsAt_idx" ON "CourseSession"("startsAt");
CREATE UNIQUE INDEX "AttendanceRecord_studentId_courseSessionId_key" ON "AttendanceRecord"("studentId", "courseSessionId");
CREATE INDEX "AttendanceRecord_courseSessionId_idx" ON "AttendanceRecord"("courseSessionId");
CREATE INDEX "AttendanceRecord_status_idx" ON "AttendanceRecord"("status");
CREATE INDEX "StudentReminder_studentId_idx" ON "StudentReminder"("studentId");
CREATE INDEX "StudentReminder_classId_idx" ON "StudentReminder"("classId");
CREATE INDEX "StudentReminder_courseSessionId_idx" ON "StudentReminder"("courseSessionId");
CREATE INDEX "StudentReminder_type_idx" ON "StudentReminder"("type");
CREATE INDEX "StudentReminder_status_idx" ON "StudentReminder"("status");
CREATE INDEX "StudentReminder_scheduledAt_idx" ON "StudentReminder"("scheduledAt");
CREATE INDEX "Student_classId_idx" ON "Student"("classId");
CREATE INDEX "Student_academicOwnerId_idx" ON "Student"("academicOwnerId");
CREATE INDEX "Student_salesOwnerId_idx" ON "Student"("salesOwnerId");
CREATE INDEX "Student_studyStatus_idx" ON "Student"("studyStatus");

-- AddForeignKey
ALTER TABLE "StudentClass" ADD CONSTRAINT "StudentClass_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudentClass" ADD CONSTRAINT "StudentClass_academicOwnerId_fkey" FOREIGN KEY ("academicOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudentClass" ADD CONSTRAINT "StudentClass_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CourseSession" ADD CONSTRAINT "CourseSession_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CourseSession" ADD CONSTRAINT "CourseSession_classId_fkey" FOREIGN KEY ("classId") REFERENCES "StudentClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CourseSession" ADD CONSTRAINT "CourseSession_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_courseSessionId_fkey" FOREIGN KEY ("courseSessionId") REFERENCES "CourseSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_recorderId_fkey" FOREIGN KEY ("recorderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudentReminder" ADD CONSTRAINT "StudentReminder_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudentReminder" ADD CONSTRAINT "StudentReminder_classId_fkey" FOREIGN KEY ("classId") REFERENCES "StudentClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudentReminder" ADD CONSTRAINT "StudentReminder_courseSessionId_fkey" FOREIGN KEY ("courseSessionId") REFERENCES "CourseSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudentReminder" ADD CONSTRAINT "StudentReminder_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "StudentClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_academicOwnerId_fkey" FOREIGN KEY ("academicOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_salesOwnerId_fkey" FOREIGN KEY ("salesOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
