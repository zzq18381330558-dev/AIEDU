import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { roleLabels } from "@/lib/roles";
import type { SessionUser } from "@/lib/session";
import { getUserDisplayName } from "@/lib/user-display";

export function Topbar({ user, campusNames }: { user: SessionUser; campusNames: string[] }) {
  const campusText = campusNames.length ? campusNames.join("、") : "未分配校区";

  return (
    <header className="flex min-h-16 items-center justify-end border-b border-line bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="rounded-md border border-line px-3 py-2 text-sm text-muted">
          <div className="font-semibold text-ink">{getUserDisplayName(user)}</div>
          <div className="mt-1 text-xs">所属角色：{roleLabels[user.role]}</div>
          <div className="mt-0.5 max-w-[52vw] truncate text-xs sm:max-w-96">所在校区：{campusText}</div>
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
