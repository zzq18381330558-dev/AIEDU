import Link from "next/link";
import { Bell } from "lucide-react";
import { crmLabels, getTodayRange, leadScopeWhere } from "@/lib/crm";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getUserDisplayName } from "@/lib/user-display";

export default async function RemindersPage() {
  const user = await requireUser("/crm");
  const today = getTodayRange();
  const leads = await prisma.lead.findMany({
    where: {
      ...leadScopeWhere(user),
      nextFollowUpAt: { gte: today.start, lt: today.end }
    },
    include: {
      campus: { select: { name: true } },
      assignee: { select: { name: true, email: true, phone: true } }
    },
    orderBy: { nextFollowUpAt: "asc" }
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink">招生中心 · 今日待跟进</h1>
            <p className="mt-1 text-sm text-muted">按下次跟进时间汇总今天需要联系的线索。</p>
          </div>
          </div>
          <div className="rounded-md border border-line px-4 py-2 text-center">
            <div className="text-xs text-muted">今日待跟进</div>
            <div className="text-lg font-semibold text-ink">{leads.length}</div>
          </div>
        </div>
      </section>

      <div className="rounded-lg border border-line bg-white">
        <div className="divide-y divide-line">
          {leads.map((lead) => (
            <Link key={lead.id} href={`/crm/${lead.id}`} className="grid gap-2 p-5 hover:bg-[#FAFBFC] md:grid-cols-[1fr_160px_160px_160px]">
              <div>
                <div className="font-semibold text-ink">{lead.name}</div>
                <div className="mt-1 text-sm text-muted">{lead.phone} · {lead.school || "未填写学校"}</div>
              </div>
              <div className="text-sm text-muted">状态：{crmLabels.status[lead.status]}</div>
              <div className="text-sm text-muted">老师：{getUserDisplayName(lead.assignee, "未分配")}</div>
              <div className="text-sm font-medium text-brand-700">{lead.nextFollowUpAt?.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</div>
            </Link>
          ))}
          {leads.length === 0 ? <div className="p-12 text-center text-sm text-muted">今天没有待跟进提醒</div> : null}
        </div>
      </div>
    </div>
  );
}
