"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpenCheck, FileStack, NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/question-bank", label: "题目列表", icon: BookOpenCheck },
  { href: "/question-bank/papers", label: "试卷管理", icon: FileStack },
  { href: "/question-bank/wrong-questions", label: "错题本", icon: NotebookPen },
  { href: "/question-bank/weakness", label: "薄弱分析", icon: BarChart3 }
];

export function QuestionTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-line bg-white px-4 py-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = pathname === tab.href;
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
