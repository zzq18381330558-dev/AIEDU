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
import type { UserRole } from "@prisma/client";
import { modulePermissions } from "@/lib/roles";

export const navItems = [
  { href: "/dashboard", label: "工作台", icon: LayoutDashboard },
  { href: "/crm", label: "招生中心", icon: UsersRound },
  { href: "/student-service", label: "学员中心", icon: BrainCircuit },
  { href: "/question-bank", label: "题库中心", icon: BookOpenCheck },
  { href: "/content", label: "教研中心", icon: GraduationCap },
  { href: "/analytics", label: "数据中心", icon: BarChart3 },
  { href: "/sop", label: "运营SOP", icon: ClipboardList },
  { href: "/settings", label: "系统设置", icon: Settings }
];

export function getNavItems(role: UserRole) {
  return navItems.filter((item) => modulePermissions[item.href]?.includes(role));
}
