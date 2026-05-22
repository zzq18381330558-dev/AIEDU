-- CreateEnum
CREATE TYPE "SopCategory" AS ENUM ('NEW_CAMPUS_LAUNCH', 'UNIVERSITY_COOPERATION', 'GROUND_PROMOTION', 'MOMENTS_OPERATION', 'CONSULTATION_CONVERSION', 'STUDENT_ONBOARDING', 'CLASS_SERVICE', 'CHECK_IN_SUPERVISION', 'EXAM_SPRINT', 'INTERVIEW_SERVICE', 'REFUND_COMPLAINT');

-- CreateEnum
CREATE TYPE "SopTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- AlterTable
ALTER TABLE "SopTemplate" ADD COLUMN "category" "SopCategory" NOT NULL DEFAULT 'NEW_CAMPUS_LAUNCH';
ALTER TABLE "SopTemplate" ADD COLUMN "summary" TEXT;
ALTER TABLE "SopTemplate" ADD COLUMN "document" TEXT;

UPDATE "SopTemplate"
SET
  "summary" = COALESCE("summary", "module" || ' 标准流程'),
  "document" = COALESCE("document", '请按步骤执行，并在校区任务清单中打卡留痕。');

ALTER TABLE "SopTemplate" ALTER COLUMN "category" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SopStep" ADD COLUMN "standard" TEXT;
ALTER TABLE "SopStep" ADD COLUMN "ownerRole" TEXT;

-- CreateTable
CREATE TABLE "SopTask" (
    "id" TEXT NOT NULL,
    "sopTemplateId" TEXT NOT NULL,
    "sopExecutionId" TEXT,
    "campusId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "SopTaskStatus" NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SopTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SopTaskCheckIn" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "evidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SopTaskCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SopInspection" (
    "id" TEXT NOT NULL,
    "sopTemplateId" TEXT NOT NULL,
    "sopExecutionId" TEXT,
    "inspectorId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "checklist" JSONB NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SopInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SopWeeklyReport" (
    "id" TEXT NOT NULL,
    "sopTemplateId" TEXT NOT NULL,
    "sopExecutionId" TEXT,
    "campusId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "blockers" TEXT,
    "nextPlan" TEXT,
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SopWeeklyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SopTemplate_category_idx" ON "SopTemplate"("category");
CREATE INDEX "SopTemplate_status_idx" ON "SopTemplate"("status");
CREATE INDEX "SopTask_sopTemplateId_idx" ON "SopTask"("sopTemplateId");
CREATE INDEX "SopTask_sopExecutionId_idx" ON "SopTask"("sopExecutionId");
CREATE INDEX "SopTask_campusId_idx" ON "SopTask"("campusId");
CREATE INDEX "SopTask_status_idx" ON "SopTask"("status");
CREATE INDEX "SopTask_dueDate_idx" ON "SopTask"("dueDate");
CREATE INDEX "SopTaskCheckIn_taskId_idx" ON "SopTaskCheckIn"("taskId");
CREATE INDEX "SopTaskCheckIn_userId_idx" ON "SopTaskCheckIn"("userId");
CREATE INDEX "SopInspection_sopTemplateId_idx" ON "SopInspection"("sopTemplateId");
CREATE INDEX "SopInspection_sopExecutionId_idx" ON "SopInspection"("sopExecutionId");
CREATE INDEX "SopInspection_inspectorId_idx" ON "SopInspection"("inspectorId");
CREATE INDEX "SopWeeklyReport_sopTemplateId_idx" ON "SopWeeklyReport"("sopTemplateId");
CREATE INDEX "SopWeeklyReport_sopExecutionId_idx" ON "SopWeeklyReport"("sopExecutionId");
CREATE INDEX "SopWeeklyReport_campusId_idx" ON "SopWeeklyReport"("campusId");
CREATE INDEX "SopWeeklyReport_weekStart_idx" ON "SopWeeklyReport"("weekStart");

-- AddForeignKey
ALTER TABLE "SopTask" ADD CONSTRAINT "SopTask_sopTemplateId_fkey" FOREIGN KEY ("sopTemplateId") REFERENCES "SopTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SopTask" ADD CONSTRAINT "SopTask_sopExecutionId_fkey" FOREIGN KEY ("sopExecutionId") REFERENCES "SopExecution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SopTask" ADD CONSTRAINT "SopTask_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SopTaskCheckIn" ADD CONSTRAINT "SopTaskCheckIn_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "SopTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SopTaskCheckIn" ADD CONSTRAINT "SopTaskCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SopInspection" ADD CONSTRAINT "SopInspection_sopTemplateId_fkey" FOREIGN KEY ("sopTemplateId") REFERENCES "SopTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SopInspection" ADD CONSTRAINT "SopInspection_sopExecutionId_fkey" FOREIGN KEY ("sopExecutionId") REFERENCES "SopExecution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SopInspection" ADD CONSTRAINT "SopInspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SopWeeklyReport" ADD CONSTRAINT "SopWeeklyReport_sopTemplateId_fkey" FOREIGN KEY ("sopTemplateId") REFERENCES "SopTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SopWeeklyReport" ADD CONSTRAINT "SopWeeklyReport_sopExecutionId_fkey" FOREIGN KEY ("sopExecutionId") REFERENCES "SopExecution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SopWeeklyReport" ADD CONSTRAINT "SopWeeklyReport_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SopWeeklyReport" ADD CONSTRAINT "SopWeeklyReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
