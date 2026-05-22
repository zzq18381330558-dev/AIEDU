-- CreateEnum
CREATE TYPE "LeadIntentLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'STRONG');

-- CreateEnum
CREATE TYPE "LeadExamTrack" AS ENUM ('INFANT', 'PRIMARY', 'MIDDLE');

-- CreateEnum
CREATE TYPE "LeadSourceChannel" AS ENUM ('UNIVERSITY_PARTNERSHIP', 'CAMPUS_PROMOTION', 'WECHAT_MOMENTS', 'SHORT_VIDEO', 'GROUND_PROMOTION', 'ENTERPRISE_WECHAT', 'REFERRAL', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadStatus_new" AS ENUM ('UNCONTACTED', 'CONTACTED', 'TRIAL', 'CONSIDERING', 'WON', 'LOST');

-- AlterTable Lead: keep existing rows by mapping the first scaffold statuses.
ALTER TABLE "Lead" ADD COLUMN "wechat" TEXT;
ALTER TABLE "Lead" ADD COLUMN "school" TEXT;
ALTER TABLE "Lead" ADD COLUMN "grade" TEXT;
ALTER TABLE "Lead" ADD COLUMN "major" TEXT;
ALTER TABLE "Lead" ADD COLUMN "examTrack" "LeadExamTrack" NOT NULL DEFAULT 'PRIMARY';
ALTER TABLE "Lead" ADD COLUMN "sourceChannel" "LeadSourceChannel" NOT NULL DEFAULT 'OTHER';
ALTER TABLE "Lead" ADD COLUMN "intentLevel" "LeadIntentLevel" NOT NULL DEFAULT 'MEDIUM';
ALTER TABLE "Lead" ADD COLUMN "lastFollowedAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN "nextFollowUpAt" TIMESTAMP(3);

ALTER TABLE "Lead" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Lead" ALTER COLUMN "status" TYPE "LeadStatus_new" USING (
  CASE "status"::text
    WHEN 'NEW' THEN 'UNCONTACTED'
    WHEN 'CONTACTED' THEN 'CONTACTED'
    WHEN 'TRIAL_BOOKED' THEN 'TRIAL'
    WHEN 'ENROLLED' THEN 'WON'
    WHEN 'LOST' THEN 'LOST'
    ELSE 'UNCONTACTED'
  END
)::"LeadStatus_new";
ALTER TABLE "Lead" ALTER COLUMN "status" SET DEFAULT 'UNCONTACTED';

ALTER TYPE "LeadStatus" RENAME TO "LeadStatus_old";
ALTER TYPE "LeadStatus_new" RENAME TO "LeadStatus";
DROP TYPE "LeadStatus_old";

UPDATE "Lead"
SET
  "sourceChannel" = CASE
    WHEN lower("source") LIKE '%高校%' THEN 'UNIVERSITY_PARTNERSHIP'::"LeadSourceChannel"
    WHEN lower("source") LIKE '%校园%' THEN 'CAMPUS_PROMOTION'::"LeadSourceChannel"
    WHEN lower("source") LIKE '%朋友圈%' THEN 'WECHAT_MOMENTS'::"LeadSourceChannel"
    WHEN lower("source") LIKE '%短视频%' THEN 'SHORT_VIDEO'::"LeadSourceChannel"
    WHEN lower("source") LIKE '%地推%' THEN 'GROUND_PROMOTION'::"LeadSourceChannel"
    WHEN lower("source") LIKE '%企微%' OR lower("source") LIKE '%企业微信%' THEN 'ENTERPRISE_WECHAT'::"LeadSourceChannel"
    ELSE 'OTHER'::"LeadSourceChannel"
  END,
  "examTrack" = CASE
    WHEN lower("targetExam") LIKE '%幼%' THEN 'INFANT'::"LeadExamTrack"
    WHEN lower("targetExam") LIKE '%中%' THEN 'MIDDLE'::"LeadExamTrack"
    ELSE 'PRIMARY'::"LeadExamTrack"
  END,
  "intentLevel" = CASE
    WHEN "intention" >= 3 THEN 'STRONG'::"LeadIntentLevel"
    WHEN "intention" = 2 THEN 'HIGH'::"LeadIntentLevel"
    WHEN "intention" = 1 THEN 'MEDIUM'::"LeadIntentLevel"
    ELSE 'LOW'::"LeadIntentLevel"
  END;

ALTER TABLE "Lead" DROP COLUMN "targetExam";
ALTER TABLE "Lead" DROP COLUMN "source";
ALTER TABLE "Lead" DROP COLUMN "intention";
ALTER TABLE "Lead" ALTER COLUMN "sourceChannel" DROP DEFAULT;

-- AlterTable LeadFollowUp
ALTER TABLE "LeadFollowUp" ADD COLUMN "creatorId" TEXT;
ALTER TABLE "LeadFollowUp" ADD COLUMN "status" "LeadStatus" NOT NULL DEFAULT 'CONTACTED';
ALTER TABLE "LeadFollowUp" ADD COLUMN "intentLevel" "LeadIntentLevel" NOT NULL DEFAULT 'MEDIUM';
ALTER TABLE "LeadFollowUp" ADD COLUMN "followAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "LeadFollowUp"
SET "creatorId" = "Lead"."creatorId"
FROM "Lead"
WHERE "LeadFollowUp"."leadId" = "Lead"."id" AND "LeadFollowUp"."creatorId" IS NULL;

ALTER TABLE "LeadFollowUp" ALTER COLUMN "creatorId" SET NOT NULL;
ALTER TABLE "LeadFollowUp" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "LeadFollowUp" ALTER COLUMN "intentLevel" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Lead_sourceChannel_idx" ON "Lead"("sourceChannel");
CREATE INDEX "Lead_intentLevel_idx" ON "Lead"("intentLevel");
CREATE INDEX "Lead_nextFollowUpAt_idx" ON "Lead"("nextFollowUpAt");
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");
CREATE INDEX "LeadFollowUp_creatorId_idx" ON "LeadFollowUp"("creatorId");
CREATE INDEX "LeadFollowUp_followAt_idx" ON "LeadFollowUp"("followAt");
CREATE INDEX "LeadFollowUp_nextAt_idx" ON "LeadFollowUp"("nextAt");

-- AddForeignKey
ALTER TABLE "LeadFollowUp" ADD CONSTRAINT "LeadFollowUp_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
