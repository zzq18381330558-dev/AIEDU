-- CreateEnum
CREATE TYPE "QuestionSubject" AS ENUM ('COMPREHENSIVE_QUALITY', 'EDUCATION_KNOWLEDGE', 'SUBJECT_KNOWLEDGE', 'INTERVIEW_STRUCTURED', 'TRIAL_LECTURE', 'DEFENSE');

-- CreateEnum
CREATE TYPE "QuestionSource" AS ENUM ('REAL_EXAM', 'MOCK', 'ORIGINAL');

-- CreateEnum
CREATE TYPE "PaperStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuestionType_new" AS ENUM ('SINGLE_CHOICE', 'MATERIAL_ANALYSIS', 'WRITING', 'SHORT_ANSWER', 'DISCRIMINATION', 'CASE_ANALYSIS');

-- AlterTable QuestionBank
ALTER TABLE "QuestionBank" ADD COLUMN "subject" "QuestionSubject" NOT NULL DEFAULT 'COMPREHENSIVE_QUALITY';
ALTER TABLE "QuestionBank" ALTER COLUMN "examTrack" TYPE "LeadExamTrack" USING (
  CASE
    WHEN lower("examTrack") LIKE '%幼%' THEN 'INFANT'
    WHEN lower("examTrack") LIKE '%中%' THEN 'MIDDLE'
    ELSE 'PRIMARY'
  END
)::"LeadExamTrack";
ALTER TABLE "QuestionBank" ALTER COLUMN "examTrack" SET DEFAULT 'PRIMARY';

-- AlterTable Question
ALTER TABLE "Question" ADD COLUMN "subject" "QuestionSubject" NOT NULL DEFAULT 'COMPREHENSIVE_QUALITY';
ALTER TABLE "Question" ADD COLUMN "chapter" TEXT NOT NULL DEFAULT '未分类章节';
ALTER TABLE "Question" ADD COLUMN "knowledgePoint" TEXT NOT NULL DEFAULT '未分类知识点';
ALTER TABLE "Question" ADD COLUMN "options" JSONB;
ALTER TABLE "Question" ADD COLUMN "highFrequencyTags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Question" ADD COLUMN "source" "QuestionSource" NOT NULL DEFAULT 'ORIGINAL';
ALTER TABLE "Question" ADD COLUMN "year" INTEGER;

ALTER TABLE "Question" ALTER COLUMN "questionBankId" DROP NOT NULL;
ALTER TABLE "Question" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Question" ALTER COLUMN "type" TYPE "QuestionType_new" USING (
  CASE "type"::text
    WHEN 'SINGLE_CHOICE' THEN 'SINGLE_CHOICE'
    WHEN 'SHORT_ANSWER' THEN 'SHORT_ANSWER'
    WHEN 'ESSAY' THEN 'WRITING'
    ELSE 'MATERIAL_ANALYSIS'
  END
)::"QuestionType_new";

ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "QuestionType_old";

UPDATE "Question"
SET "highFrequencyTags" = COALESCE("tags", ARRAY[]::TEXT[]);

ALTER TABLE "Question" DROP COLUMN "tags";
ALTER TABLE "Question" ALTER COLUMN "highFrequencyTags" SET NOT NULL;
ALTER TABLE "Question" ALTER COLUMN "subject" DROP DEFAULT;
ALTER TABLE "Question" ALTER COLUMN "chapter" DROP DEFAULT;
ALTER TABLE "Question" ALTER COLUMN "knowledgePoint" DROP DEFAULT;

-- CreateTable
CREATE TABLE "ExamPaper" (
    "id" TEXT NOT NULL,
    "questionBankId" TEXT,
    "title" TEXT NOT NULL,
    "subject" "QuestionSubject" NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 100,
    "durationMinutes" INTEGER NOT NULL DEFAULT 120,
    "status" "PaperStatus" NOT NULL DEFAULT 'DRAFT',
    "strategy" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamPaperQuestion" (
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "ExamPaperQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WrongQuestionRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT,
    "reason" TEXT,
    "mastered" BOOLEAN NOT NULL DEFAULT false,
    "wrongAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WrongQuestionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionBank_subject_idx" ON "QuestionBank"("subject");
CREATE INDEX "QuestionBank_examTrack_idx" ON "QuestionBank"("examTrack");
CREATE INDEX "Question_subject_idx" ON "Question"("subject");
CREATE INDEX "Question_chapter_idx" ON "Question"("chapter");
CREATE INDEX "Question_knowledgePoint_idx" ON "Question"("knowledgePoint");
CREATE INDEX "Question_type_idx" ON "Question"("type");
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");
CREATE INDEX "Question_source_idx" ON "Question"("source");
CREATE INDEX "Question_year_idx" ON "Question"("year");
CREATE INDEX "ExamPaper_questionBankId_idx" ON "ExamPaper"("questionBankId");
CREATE INDEX "ExamPaper_subject_idx" ON "ExamPaper"("subject");
CREATE INDEX "ExamPaper_status_idx" ON "ExamPaper"("status");
CREATE UNIQUE INDEX "ExamPaperQuestion_paperId_questionId_key" ON "ExamPaperQuestion"("paperId", "questionId");
CREATE INDEX "ExamPaperQuestion_questionId_idx" ON "ExamPaperQuestion"("questionId");
CREATE INDEX "WrongQuestionRecord_studentId_idx" ON "WrongQuestionRecord"("studentId");
CREATE INDEX "WrongQuestionRecord_questionId_idx" ON "WrongQuestionRecord"("questionId");
CREATE INDEX "WrongQuestionRecord_mastered_idx" ON "WrongQuestionRecord"("mastered");
CREATE INDEX "WrongQuestionRecord_wrongAt_idx" ON "WrongQuestionRecord"("wrongAt");

-- AddForeignKey
ALTER TABLE "ExamPaper" ADD CONSTRAINT "ExamPaper_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExamPaperQuestion" ADD CONSTRAINT "ExamPaperQuestion_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "ExamPaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExamPaperQuestion" ADD CONSTRAINT "ExamPaperQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WrongQuestionRecord" ADD CONSTRAINT "WrongQuestionRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WrongQuestionRecord" ADD CONSTRAINT "WrongQuestionRecord_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
