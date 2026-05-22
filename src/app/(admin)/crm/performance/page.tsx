import { TrendingUp } from "lucide-react";
import { buildPerformanceRows, crmLabels, leadScopeWhere } from "@/lib/crm";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function PerformancePage() {
  const user = await requireUser("/crm");
  const leadWhere = leadScopeWhere(user);
  const userWhere =
    user.role === "ADMISSIONS_COUNSELOR"
      ? { id: user.id }
      : user.role === "CAMPUS_MANAGER" && user.campusId
        ? { role: "ADMISSIONS_COUNSELOR" as const, status: "ACTIVE" as const, campusId: user.campusId }
        : { role: "ADMISSIONS_COUNSELOR" as const, status: "ACTIVE" as const };

  const [users, leads, sourceGroups] = await Promise.all([
    prisma.user.findMany({
      where: userWhere,
      include: { campus: { select: { name: true } } },
      orderBy: { name: "asc" }
    }),
    prisma.lead.findMany({
      where: leadWhere,
      select: { assigneeId: true, status: true, createdAt: true }
    }),
    prisma.lead.groupBy({
      by: ["sourceChannel"],
      where: leadWhere,
      _count: { _all: true }
    })
  ]);
  const rows = buildPerformanceRows(users, leads);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink">招生老师业绩统计</h1>
            <p className="mt-1 text-sm text-muted">统计线索分配、有效联系、成交数量和成交率。</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="已分配线索" value={String(rows.reduce((sum, row) => sum + row.assignedCount, 0))} />
        <Metric label="已成交" value={String(rows.reduce((sum, row) => sum + row.wonCount, 0))} />
        <Metric
          label="平均成交率"
          value={`${rows.length ? Math.round((rows.reduce((sum, row) => sum + row.conversionRate, 0) / rows.length) * 10) / 10 : 0}%`}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFB] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">招生老师</th>
                <th className="px-4 py-3 font-medium">校区</th>
                <th className="px-4 py-3 font-medium">分配线索</th>
                <th className="px-4 py-3 font-medium">已联系</th>
                <th className="px-4 py-3 font-medium">已成交</th>
                <th className="px-4 py-3 font-medium">成交率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.userId}>
                  <td className="px-4 py-3 font-semibold text-ink">{row.name}</td>
                  <td className="px-4 py-3 text-muted">{row.campusName}</td>
                  <td className="px-4 py-3">{row.assignedCount}</td>
                  <td className="px-4 py-3">{row.contactedCount}</td>
                  <td className="px-4 py-3">{row.wonCount}</td>
                  <td className="px-4 py-3 text-brand-700">{row.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <div className="font-semibold text-ink">渠道贡献</div>
          <div className="mt-3 space-y-3">
            {sourceGroups.map((item) => (
              <div key={item.sourceChannel} className="flex items-center justify-between text-sm">
                <span className="text-muted">{crmLabels.sourceChannel[item.sourceChannel]}</span>
                <span className="font-semibold text-ink">{item._count._all}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-3 text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}
