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
  { href: "/crm", label: "招生 CRM", icon: UsersRound },
  { href: "/student-service", label: "AI 学员服务", icon: BrainCircuit },
  { href: "/question-bank", label: "AI 题库", icon: BookOpenCheck },
  { href: "/content", label: "教研内容生产", icon: GraduationCap },
  { href: "/analytics", label: "数据分析", icon: BarChart3 },
  { href: "/sop", label: "校区复制 SOP", icon: ClipboardList },
  { href: "/settings", label: "系统设置", icon: Settings }
];

export function getNavItems(role: UserRole) {
  return navItems.filter((item) => modulePermissions[item.href]?.includes(role));
}
