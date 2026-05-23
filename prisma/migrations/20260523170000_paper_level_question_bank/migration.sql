-- Paper-level question bank fields. Existing auto-generated papers remain compatible.
ALTER TABLE "ExamPaper" ADD COLUMN IF NOT EXISTS "paperType" TEXT NOT NULL DEFAULT 'MOCK';
ALTER TABLE "ExamPaper" ADD COLUMN IF NOT EXISTS "stage" TEXT;
ALTER TABLE "ExamPaper" ADD COLUMN IF NOT EXISTS "year" INTEGER;
ALTER TABLE "ExamPaper" ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE "ExamPaper" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "ExamPaper" ADD COLUMN IF NOT EXISTS "questionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ExamPaper" ADD COLUMN IF NOT EXISTS "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM';
ALTER TABLE "ExamPaper" ADD COLUMN IF NOT EXISTS "description" TEXT;

ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "paperId" TEXT;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "questionNo" TEXT;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "score" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Question_paperId_fkey'
  ) THEN
    ALTER TABLE "Question"
    ADD CONSTRAINT "Question_paperId_fkey"
    FOREIGN KEY ("paperId") REFERENCES "ExamPaper"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "ExamPaper_paperType_idx" ON "ExamPaper"("paperType");
CREATE INDEX IF NOT EXISTS "ExamPaper_stage_idx" ON "ExamPaper"("stage");
CREATE INDEX IF NOT EXISTS "ExamPaper_year_idx" ON "ExamPaper"("year");
CREATE INDEX IF NOT EXISTS "Question_paperId_idx" ON "Question"("paperId");
CREATE INDEX IF NOT EXISTS "Question_questionNo_idx" ON "Question"("questionNo");

UPDATE "ExamPaper" p
SET "questionCount" = q.count
FROM (
  SELECT "paperId", COUNT(*)::INTEGER AS count
  FROM "Question"
  WHERE "paperId" IS NOT NULL
  GROUP BY "paperId"
) q
WHERE p.id = q."paperId";
