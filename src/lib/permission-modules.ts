export const permissionModules = [
  { key: "dashboard", label: "工作台", path: "/dashboard" },
  { key: "crm", label: "招生中心", path: "/crm" },
  { key: "courses", label: "课程中心", path: "/courses" },
  { key: "student-service", label: "学员中心", path: "/student-service" },
  { key: "question-bank", label: "题库中心", path: "/question-bank" },
  { key: "content", label: "教研中心", path: "/content" },
  { key: "analytics", label: "数据中心", path: "/analytics" },
  { key: "sop", label: "运营SOP", path: "/sop" },
  { key: "settings", label: "系统设置", path: "/settings" }
] as const;

export type PermissionModule = (typeof permissionModules)[number]["key"];

const moduleKeys = new Set<string>(permissionModules.map((item) => item.key));

export function isPermissionModule(value: string): value is PermissionModule {
  return moduleKeys.has(value);
}
