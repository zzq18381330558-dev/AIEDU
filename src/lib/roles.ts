import type { UserRole } from "@prisma/client";

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "管理员",
  HQ_OPERATIONS: "总部运营",
  CAMPUS_MANAGER: "校区负责人",
  ADMISSIONS_COUNSELOR: "招生老师",
  ACADEMIC_TEACHER: "教务老师",
  LECTURER: "授课老师"
};

export const roleHome: Record<UserRole, string> = {
  ADMIN: "/dashboard",
  HQ_OPERATIONS: "/dashboard",
  CAMPUS_MANAGER: "/dashboard",
  ADMISSIONS_COUNSELOR: "/crm",
  ACADEMIC_TEACHER: "/student-service",
  LECTURER: "/content"
};

export const modulePermissions: Record<string, UserRole[]> = {
  "/dashboard": ["ADMIN", "HQ_OPERATIONS", "CAMPUS_MANAGER"],
  "/crm": ["ADMIN", "HQ_OPERATIONS", "CAMPUS_MANAGER", "ADMISSIONS_COUNSELOR"],
  "/student-service": ["ADMIN", "HQ_OPERATIONS", "CAMPUS_MANAGER", "ADMISSIONS_COUNSELOR", "ACADEMIC_TEACHER"],
  "/question-bank": ["ADMIN", "HQ_OPERATIONS", "ACADEMIC_TEACHER", "LECTURER"],
  "/content": ["ADMIN", "HQ_OPERATIONS", "ACADEMIC_TEACHER", "LECTURER"],
  "/analytics": ["ADMIN", "HQ_OPERATIONS", "CAMPUS_MANAGER"],
  "/sop": ["ADMIN", "HQ_OPERATIONS", "CAMPUS_MANAGER"],
  "/settings": ["ADMIN"]
};

export function canAccess(role: UserRole, pathname: string) {
  const entry = Object.entries(modulePermissions)
    .sort(([a], [b]) => b.length - a.length)
    .find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  return entry ? entry[1].includes(role) : true;
}
