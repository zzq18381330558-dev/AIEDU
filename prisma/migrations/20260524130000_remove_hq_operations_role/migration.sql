-- Merge the historical HQ_OPERATIONS role into ADMIN before replacing the enum.
UPDATE "User"
SET "role" = 'ADMIN'
WHERE "role" = 'HQ_OPERATIONS';

UPDATE "RolePermission" AS admin_permission
SET "enabled" = admin_permission."enabled" OR hq_permission."enabled"
FROM "RolePermission" AS hq_permission
WHERE admin_permission."role" = 'ADMIN'
  AND hq_permission."role" = 'HQ_OPERATIONS'
  AND admin_permission."module" = hq_permission."module";

DELETE FROM "RolePermission" AS hq_permission
WHERE hq_permission."role" = 'HQ_OPERATIONS'
  AND EXISTS (
    SELECT 1
    FROM "RolePermission" AS admin_permission
    WHERE admin_permission."role" = 'ADMIN'
      AND admin_permission."module" = hq_permission."module"
  );

UPDATE "RolePermission"
SET "role" = 'ADMIN'
WHERE "role" = 'HQ_OPERATIONS';

ALTER TYPE "UserRole" RENAME TO "UserRole_old";
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CAMPUS_MANAGER', 'ADMISSIONS_COUNSELOR', 'ACADEMIC_TEACHER', 'LECTURER');

ALTER TABLE "User"
ALTER COLUMN "role" TYPE "UserRole"
USING ("role"::text::"UserRole");

ALTER TABLE "RolePermission"
ALTER COLUMN "role" TYPE "UserRole"
USING ("role"::text::"UserRole");

DROP TYPE "UserRole_old";
