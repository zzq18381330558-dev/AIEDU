"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, ClipboardCheck, GraduationCap, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/student-service", label: "学员档案", icon: GraduationCap },
  { href: "/student-service/classes", label: "班级管理", icon: UsersRound },
  { href: "/student-service/schedule", label: "课程表", icon: CalendarDays },
  { href: "/student-service/check-ins", label: "打卡记录", icon: ClipboardCheck },
  { href: "/student-service/absences", label: "缺课提醒", icon: Bell }
];

export function ServiceTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-line bg-white px-4 py-3">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm text-muted hover:bg-brand-50 hover:text-brand-700",
              active && "bg-brand-50 text-brand-700"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
