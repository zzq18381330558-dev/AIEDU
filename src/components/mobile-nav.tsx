"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { getNavItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileNav({ role, allowedModules }: { role: UserRole; allowedModules: string[] }) {
  const pathname = usePathname();
  const items = getNavItems(role, allowedModules);

  return (
    <div className="border-b border-line bg-white px-3 py-2 lg:hidden">
      <div className="flex gap-2 overflow-x-auto">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm text-muted",
                active && "bg-brand-50 text-brand-700"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
