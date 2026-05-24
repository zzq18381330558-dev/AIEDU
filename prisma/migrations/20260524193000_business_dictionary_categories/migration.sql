CREATE TABLE "BusinessDictionaryCategory" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BusinessDictionaryCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BusinessDictionaryCategory_code_key" ON "BusinessDictionaryCategory"("code");
CREATE INDEX "BusinessDictionaryCategory_isSystem_idx" ON "BusinessDictionaryCategory"("isSystem");

INSERT INTO "BusinessDictionaryCategory" ("id", "code", "name", "isSystem", "createdAt", "updatedAt")
VALUES
  ('system-dict-category-school', 'SCHOOL', '院校名称', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('system-dict-category-major', 'MAJOR', '专业名称', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('system-dict-category-exam-track', 'EXAM_TRACK', '教资方向', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('system-dict-category-lead-source', 'LEAD_SOURCE', '线索来源', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('system-dict-category-question-type', 'QUESTION_TYPE', '题目类型', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('system-dict-category-difficulty', 'DIFFICULTY', '难度等级', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('system-dict-category-class-type', 'CLASS_TYPE', '课程类型', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE
SET "name" = EXCLUDED."name",
    "isSystem" = true,
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "BusinessDictionaryCategory" ("id", "code", "name", "isSystem", "createdAt", "updatedAt")
SELECT
  'dict-category-' || md5(category::text),
  category::text,
  category::text,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "BusinessDictionary"
WHERE category::text NOT IN (
  SELECT "code" FROM "BusinessDictionaryCategory"
)
GROUP BY category::text
ON CONFLICT ("code") DO NOTHING;
