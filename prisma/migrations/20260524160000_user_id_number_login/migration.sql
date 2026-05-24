ALTER TABLE "User" ADD COLUMN "idNumber" TEXT;

CREATE INDEX "User_phone_idx" ON "User"("phone");
CREATE INDEX "User_idNumber_idx" ON "User"("idNumber");
