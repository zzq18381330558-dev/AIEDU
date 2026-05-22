import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { roleLabels } from "@/lib/roles";
import type { SessionUser } from "@/lib/session";

export function Topbar({ user }: { user: SessionUser }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-4 sm:px-6">
      <div>
        <div className="text-sm text-muted">欢迎回来</div>
        <div className="font-semibold text-ink">{user.name}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden rounded-md border border-line px-3 py-1.5 text-sm text-muted sm:block">
          {roleLabels[user.role]}
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm text-muted transition hover:border-brand-500 hover:text-brand-700"
          >
            <LogOut className="h-4 w-4" />
            退出
          </button>
        </form>
      </div>
    </header>
  );
}
