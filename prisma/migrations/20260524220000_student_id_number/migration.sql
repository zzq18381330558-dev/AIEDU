-- Add optional student ID number. It is indexed for lookup/filtering but not unique
-- because historical student records may contain duplicates.
ALTER TABLE "Student" ADD COLUMN "idNumber" TEXT;

CREATE INDEX "Student_idNumber_idx" ON "Student"("idNumber");
