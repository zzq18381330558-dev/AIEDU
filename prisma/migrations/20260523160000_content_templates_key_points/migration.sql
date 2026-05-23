-- CreateTable
CREATE TABLE "TeachingContentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "type" "TeachingContentType" NOT NULL,
    "structureMarkdown" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeachingContentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingKeyPoint" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL,
    "questionTypes" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "mistakes" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeachingKeyPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeachingContentTemplate_subject_idx" ON "TeachingContentTemplate"("subject");
CREATE INDEX "TeachingContentTemplate_chapter_idx" ON "TeachingContentTemplate"("chapter");
CREATE INDEX "TeachingContentTemplate_type_idx" ON "TeachingContentTemplate"("type");
CREATE INDEX "TeachingContentTemplate_enabled_idx" ON "TeachingContentTemplate"("enabled");

-- CreateIndex
CREATE INDEX "TeachingKeyPoint_subject_idx" ON "TeachingKeyPoint"("subject");
CREATE INDEX "TeachingKeyPoint_chapter_idx" ON "TeachingKeyPoint"("chapter");
CREATE INDEX "TeachingKeyPoint_frequency_idx" ON "TeachingKeyPoint"("frequency");
