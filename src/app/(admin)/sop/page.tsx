import Link from "next/link";
import { BarChart3, ClipboardList, FileText, ListChecks, ShieldCheck } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { SopTemplateForm } from "@/components/sop/sop-forms";
import { buildSopScopeWhere } from "@/lib/data-scope";
import {
  canManageSop,
  computeCompletionRate,
  isSopCategory,
  sopCategoryOptions,
  sopLabels,
  sopTaskScopeWhere
} from "@/lib/sop";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getUserDisplayName } from "@/lib/user-display";

export default async function SopPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser("/sop");
  const params = await searchParams;
  const category = typeof params.category === "string" && isSopCategory(params.category) ? params.category : "";
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const templateWhere: Prisma.SopTemplateWhereInput = {};
  if (category) templateWhere.category = category as Prisma.EnumSopCategoryFilter["equals"];
  if (search) {
    templateWhere.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { module: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } }
    ];
  }

  const taskScope = sopTaskScopeWhere(user);
  const sopScope = await buildSopScopeWhere(user);
  const [templates, activeCount, executions, totalTasks, doneTasks, blockedTasks, reports, inspections] = await Promise.all([
    prisma.sopTemplate.findMany({
      where: templateWhere,
      include: {
        steps: { orderBy: { sortOrder: "asc" } },
        _count: { select: { executions: true, tasks: true, inspections: true, weeklyReports: true } }
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 100
    }),
    prisma.sopTemplate.count({ where: { status: "ACTIVE" } }),
    prisma.sopExecution.findMany({
      where: sopScope.execution,
      include: {
        campus: { select: { name: true } },
        template: { select: { title: true, category: true } },
        _count: { select: { tasks: true } }
      },
      orderBy: { updatedAt: "desc" },
      take: 8
    }),
    prisma.sopTask.count({ where: taskScope }),
    prisma.sopTask.count({ where: { ...taskScope, status: "DONE" } }),
    prisma.sopTask.count({ where: { ...taskScope, status: "BLOCKED" } }),
    prisma.sopWeeklyReport.findMany({
      where: sopScope.weeklyReport,
      include: {
        campus: { select: { name: true } },
        reporter: { select: { name: true, phone: true } },
        template: { select: { title: true } }
      },
      orderBy: { weekStart: "desc" },
      take: 5
    }),
    prisma.sopInspection.findMany({
      where: sopScope.inspection,
      include: {
        inspector: { select: { name: true, phone: true } },
        template: { select: { title: true } },
        execution: { include: { campus: { select: { name: true } } } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  const completionRate = computeCompletionRate(doneTasks, totalTasks);
  const canCreate = canManageSop(user.role);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-ink">运营SOP</h1>
              <p className="mt-2 text-sm text-muted">统一沉淀招生、教务、校园代理、开班和退费处理流程，校区按任务清单执行并留痕。</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <Metric label="启用 SOP" value={String(activeCount)} />
            <Metric label="任务完成度" value={`${completionRate}%`} />
            <Metric label="阻塞任务" value={String(blockedTasks)} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} label="SOP 文档库" value={templates.length} hint="按总部标准维护" />
        <StatCard icon={ListChecks} label="每日任务清单" value={totalTasks} hint={`${doneTasks} 个已完成`} />
        <StatCard icon={ShieldCheck} label="总部检查表" value={inspections.length} hint="最近检查记录" />
        <StatCard icon={BarChart3} label="校区周报" value={reports.length} hint="最近提交记录" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <form className="grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-[1fr_220px_90px]">
            <input name="search" defaultValue={search} placeholder="搜索 SOP 标题、模块、摘要" className="h-10 rounded-md border border-line px-3 text-sm" />
            <select name="category" defaultValue={category} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
              <option value="">全部分类</option>
              {sopCategoryOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <button className="h-10 rounded-md bg-brand-600 text-sm font-semibold text-white">筛选</button>
          </form>

          <section className="overflow-hidden rounded-lg border border-line bg-white">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#F8FAFB] text-muted">
                <tr>
                  <Th>SOP 文档</Th>
                  <Th>分类</Th>
                  <Th>模块</Th>
                  <Th>状态</Th>
                  <Th>步骤</Th>
                  <Th>执行校区</Th>
                  <Th>任务</Th>
                  <Th>检查/周报</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {templates.map((item) => (
                  <tr key={item.id} className="align-top hover:bg-[#FAFBFC]">
                    <Td className="max-w-sm whitespace-normal">
                      <Link href={`/sop/${item.id}`} className="font-semibold text-brand-700">{item.title}</Link>
                      <div className="mt-1 text-xs leading-5 text-muted">{item.summary || item.document?.slice(0, 80) || "暂无摘要"}</div>
                    </Td>
                    <Td>
                      {sopLabels.category[item.category]}
                      <div className="text-xs text-muted">{sopLabels.categoryGroup[item.category]}</div>
                    </Td>
                    <Td>{item.module}</Td>
                    <Td>{sopLabels.status[item.status]}</Td>
                    <Td>{item.steps.length}</Td>
                    <Td>{item._count.executions}</Td>
                    <Td>{item._count.tasks}</Td>
                    <Td>{item._count.inspections} / {item._count.weeklyReports}</Td>
                  </tr>
                ))}
                {templates.length === 0 ? <tr><td colSpan={8} className="px-4 py-12 text-center text-muted">暂无 SOP</td></tr> : null}
              </tbody>
            </table>
          </section>
        </div>

        <div className="space-y-4">
          {canCreate ? <SopTemplateForm /> : null}
          <SidePanel title="执行中校区">
            {executions.map((item) => (
              <Link key={item.id} href={`/sop/${item.sopTemplateId}`} className="block border-b border-line p-4 last:border-0 hover:bg-[#FAFBFC]">
                <div className="font-semibold text-ink">{item.campus.name}</div>
                <div className="mt-1 text-sm text-muted">{item.template.title}</div>
                <div className="mt-2 text-xs text-brand-700">完成度 {item.progress}% · 任务 {item._count.tasks}</div>
              </Link>
            ))}
            {executions.length === 0 ? <Empty>暂无执行记录</Empty> : null}
          </SidePanel>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <SidePanel title="最近校区周报">
          {reports.map((item) => (
            <div key={item.id} className="border-b border-line p-4 last:border-0">
              <div className="font-semibold text-ink">{item.campus.name} · {item.weekStart.toLocaleDateString("zh-CN")}</div>
              <div className="mt-1 text-xs text-muted">{item.template.title} / {getUserDisplayName(item.reporter)}</div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{item.summary}</p>
            </div>
          ))}
          {reports.length === 0 ? <Empty>暂无周报</Empty> : null}
        </SidePanel>
        <SidePanel title="最近总部检查">
          {inspections.map((item) => (
            <div key={item.id} className="border-b border-line p-4 last:border-0">
              <div className="font-semibold text-ink">{item.template.title}</div>
              <div className="mt-1 text-sm text-brand-700">评分 {item.score}</div>
              <div className="mt-1 text-xs text-muted">{item.execution?.campus.name || "文档检查"} / {getUserDisplayName(item.inspector)}</div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{item.comment || "无检查意见"}</p>
            </div>
          ))}
          {inspections.length === 0 ? <Empty>暂无检查记录</Empty> : null}
        </SidePanel>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-line px-4 py-2"><div className="text-xs text-muted">{label}</div><div className="text-lg font-semibold text-ink">{value}</div></div>;
}

function StatCard({ icon: Icon, label, value, hint }: { icon: typeof FileText; label: string; value: number; hint: string }) {
  return <div className="rounded-lg border border-line bg-white p-5"><div className="flex items-center justify-between"><div className="text-sm text-muted">{label}</div><Icon className="h-4 w-4 text-brand-600" /></div><div className="mt-4 text-3xl font-semibold text-ink">{value}</div><div className="mt-2 text-xs text-muted">{hint}</div></div>;
}

function SidePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="overflow-hidden rounded-lg border border-line bg-white"><div className="border-b border-line px-5 py-4 font-semibold text-ink">{title}</div>{children}</section>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="p-8 text-center text-sm text-muted">{children}</div>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-4 py-3 text-ink ${className}`}>{children}</td>;
}
