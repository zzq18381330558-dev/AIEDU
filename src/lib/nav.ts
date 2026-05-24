import {
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Settings,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@prisma/client";
import type { PermissionModule } from "@/lib/permission-modules";
import { modulePermissions } from "@/lib/roles";

export const navItems = [
  { href: "/dashboard", label: "工作台", icon: LayoutDashboard, module: "dashboard" },
  { href: "/crm", label: "招生中心", icon: UsersRound, module: "crm" },
  { href: "/student-service", label: "学员中心", icon: BrainCircuit, module: "student-service" },
  { href: "/question-bank", label: "题库中心", icon: BookOpenCheck, module: "question-bank" },
  { href: "/content", label: "教研中心", icon: GraduationCap, module: "content" },
  { href: "/analytics", label: "数据中心", icon: BarChart3, module: "analytics" },
  { href: "/sop", label: "运营SOP", icon: ClipboardList, module: "sop" },
  { href: "/settings", label: "系统设置", icon: Settings, module: "settings" }
] satisfies Array<{ href: string; label: string; icon: LucideIcon; module: PermissionModule }>;

export function getNavItems(role: UserRole, allowedModules?: readonly string[]) {
  if (allowedModules) return navItems.filter((item) => allowedModules.includes(item.module));
  return navItems.filter((item) => modulePermissions[item.href]?.includes(role));
}

export function getAllowedNavItems(allowedModules: readonly string[]) {
  const allowed = new Set(allowedModules);
  return navItems.filter((item) => allowed.has(item.module));
}
