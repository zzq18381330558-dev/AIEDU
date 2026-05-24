-- CreateTable
CREATE TABLE "CampusAssistant" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampusAssistant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampusAssistant_campusId_userId_key" ON "CampusAssistant"("campusId", "userId");

-- CreateIndex
CREATE INDEX "CampusAssistant_campusId_idx" ON "CampusAssistant"("campusId");

-- CreateIndex
CREATE INDEX "CampusAssistant_userId_idx" ON "CampusAssistant"("userId");

-- AddForeignKey
ALTER TABLE "CampusAssistant" ADD CONSTRAINT "CampusAssistant_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampusAssistant" ADD CONSTRAINT "CampusAssistant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
