"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderKanban, Layers, Lightbulb, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/content", label: "内容库", icon: FolderKanban },
  { href: "/content/new", label: "新建内容", icon: Plus },
  { href: "/content/templates", label: "教研模板库", icon: Layers },
  { href: "/content/key-points", label: "高频考点库", icon: Lightbulb },
  { href: "/content/campus-materials", label: "校区资料中心", icon: FileText }
];

export function ContentTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-line bg-white px-4 py-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href} className={cn("inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm text-muted hover:bg-brand-50 hover:text-brand-700", active && "bg-brand-50 text-brand-700")}>
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
