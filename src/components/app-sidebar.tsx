"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { getNavItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function AppSidebar({ role, allowedModules }: { role: UserRole; allowedModules: string[] }) {
  const pathname = usePathname();
  const items = getNavItems(role, allowedModules);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-white lg:block">
      <div className="flex h-16 items-center border-b border-line px-5">
        <div>
          <div className="text-sm font-semibold text-brand-600">AI EDU</div>
          <div className="text-xs text-muted">教师资格证培训后台</div>
        </div>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted transition hover:bg-brand-50 hover:text-brand-700",
                active && "bg-brand-50 text-brand-700"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
