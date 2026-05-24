import type { UserRole } from "@prisma/client";

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "管理员",
  CAMPUS_MANAGER: "校区校长",
  ADMISSIONS_COUNSELOR: "招生老师",
  ACADEMIC_TEACHER: "教务老师",
  LECTURER: "授课老师"
};

export const roleHome: Record<UserRole, string> = {
  ADMIN: "/dashboard",
  CAMPUS_MANAGER: "/dashboard",
  ADMISSIONS_COUNSELOR: "/crm",
  ACADEMIC_TEACHER: "/student-service",
  LECTURER: "/content"
};

export const modulePermissions: Record<string, UserRole[]> = {
  "/dashboard": ["ADMIN", "CAMPUS_MANAGER"],
  "/crm": ["ADMIN", "CAMPUS_MANAGER", "ADMISSIONS_COUNSELOR"],
  "/courses": ["ADMIN", "CAMPUS_MANAGER", "ACADEMIC_TEACHER", "LECTURER"],
  "/student-service": ["ADMIN", "CAMPUS_MANAGER", "ADMISSIONS_COUNSELOR", "ACADEMIC_TEACHER"],
  "/question-bank": ["ADMIN", "ACADEMIC_TEACHER", "LECTURER"],
  "/content": ["ADMIN", "ACADEMIC_TEACHER", "LECTURER"],
  "/analytics": ["ADMIN", "CAMPUS_MANAGER"],
  "/sop": ["ADMIN", "CAMPUS_MANAGER"],
  "/settings": ["ADMIN", "CAMPUS_MANAGER"]
};

export function canAccess(role: UserRole, pathname: string) {
  const entry = Object.entries(modulePermissions)
    .sort(([a], [b]) => b.length - a.length)
    .find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  return entry ? entry[1].includes(role) : true;
}
