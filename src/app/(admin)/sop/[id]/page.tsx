import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import {
  SopExecutionForm,
  SopInspectionForm,
  SopTaskCheckInForm,
  SopTaskEditForm,
  SopTaskForm,
  SopWeeklyReportForm
} from "@/components/sop/sop-forms";
import {
  canInspectSop,
  canManageSop,
  computeCompletionRate,
  sopCampusWhere,
  sopExecutionScopeWhere,
  sopLabels,
  sopTaskScopeWhere
} from "@/lib/sop";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getUserDisplayName } from "@/lib/user-display";

export default async function SopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("/sop");
  const { id } = await params;
  const executionScope = sopExecutionScopeWhere(user);
  const taskScope = sopTaskScopeWhere(user);

  const [template, campuses, executions, tasks, inspections, weeklyReports] = await Promise.all([
    prisma.sopTemplate.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { sortOrder: "asc" } }
      }
    }),
    prisma.campus.findMany({
      where: sopCampusWhere(user),
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.sopExecution.findMany({
      where: { sopTemplateId: id, ...executionScope },
      include: {
        campus: { select: { id: true, name: true } },
        _count: { select: { tasks: true, inspections: true, weeklyReports: true } }
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.sopTask.findMany({
      where: { sopTemplateId: id, ...taskScope },
      include: {
        campus: { select: { id: true, name: true } },
        execution: { select: { id: true, owner: true } },
        checkIns: {
          include: { user: { select: { name: true, email: true, phone: true } } },
          orderBy: { createdAt: "desc" },
          take: 3
        }
      },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }]
    }),
    prisma.sopInspection.findMany({
      where: { sopTemplateId: id },
      include: {
        inspector: { select: { name: true, email: true, phone: true } },
        execution: { include: { campus: { select: { name: true } } } }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.sopWeeklyReport.findMany({
      where: {
        sopTemplateId: id,
        ...(user.role === "ADMIN" || user.role === "HQ_OPERATIONS"
          ? { campus: { organizationId: user.organizationId } }
          : user.campusId
            ? { campusId: user.campusId }
            : { id: "__none__" })
      },
      include: {
        campus: { select: { id: true, name: true } },
        reporter: { select: { name: true, email: true, phone: true } },
        execution: { select: { id: true, owner: true } }
      },
      orderBy: { weekStart: "desc" },
      take: 20
    })
  ]);

  if (!template) notFound();

  const doneTasks = tasks.filter((item) => item.status === "DONE").length;
  const blockedTasks = tasks.filter((item) => item.status === "BLOCKED").length;
  const completionRate = computeCompletionRate(doneTasks, tasks.length);
  const canManage = canManageSop(user.role);
  const canInspect = canInspectSop(user.role);
  const executionOptions = executions.map((item) => ({
    id: item.id,
    owner: item.owner,
    campus: item.campus
  }));

  return (
    <div className="space-y-6">
      <Link href="/sop" className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" />
        返回运营SOP
      </Link>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge>{sopLabels.category[template.category]}</Badge>
              <Badge>{sopLabels.categoryGroup[template.category]}</Badge>
              <Badge>{sopLabels.status[template.status]}</Badge>
              <Badge>v{template.version}</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-ink">{template.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{template.summary || "暂无摘要"}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <Metric label="完成度" value={`${completionRate}%`} />
            <Metric label="执行校区" value={String(executions.length)} />
            <Metric label="阻塞任务" value={String(blockedTasks)} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Panel title="SOP 标准文档">
            <pre className="whitespace-pre-wrap p-5 text-sm leading-7 text-ink">{template.document || "暂无标准文档"}</pre>
          </Panel>

          <Panel title="标准步骤">
            <div className="divide-y divide-line">
              {template.steps.map((step) => (
                <div key={step.id} className="grid gap-3 p-5 md:grid-cols-[48px_1fr]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-sm font-semibold text-brand-700">{step.sortOrder}</div>
                  <div>
                    <div className="font-semibold text-ink">{step.title}</div>
                    {step.standard ? <div className="mt-2 text-sm leading-6 text-muted">验收标准：{step.standard}</div> : null}
                    {step.ownerRole ? <div className="mt-1 text-xs text-muted">责任角色：{step.ownerRole}</div> : null}
                  </div>
                </div>
              ))}
              {template.steps.length === 0 ? <Empty>暂无标准步骤</Empty> : null}
            </div>
          </Panel>

          <Panel title="校区每日任务清单">
            <div className="divide-y divide-line">
              {tasks.map((task) => (
                <div key={task.id} className="p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Status status={task.status} />
                        <div className="font-semibold text-ink">{task.title}</div>
                      </div>
                      <div className="mt-2 text-sm text-muted">
                        {task.campus.name} / {task.execution?.owner || "未关联执行"}
                        {task.dueDate ? ` / 截止 ${task.dueDate.toLocaleString("zh-CN")}` : ""}
                      </div>
                      {task.description ? <p className="mt-2 text-sm leading-6 text-muted">{task.description}</p> : null}
                    </div>
                    {task.status === "DONE" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Clock className="h-5 w-5 text-muted" />}
                  </div>
                  <SopTaskEditForm
                    task={{
                      id: task.id,
                      title: task.title,
                      description: task.description,
                      status: task.status,
                      dueDate: toDateTimeLocal(task.dueDate)
                    }}
                  />
                  <SopTaskCheckInForm taskId={task.id} />
                  {task.checkIns.length ? (
                    <div className="mt-3 space-y-2">
                      {task.checkIns.map((checkIn) => (
                        <div key={checkIn.id} className="rounded-md border border-line bg-white px-3 py-2 text-xs leading-5 text-muted">
                          <span className="font-semibold text-ink">{getUserDisplayName(checkIn.user)}</span>：{checkIn.note}
                          {checkIn.evidence ? <div>凭证：{checkIn.evidence}</div> : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {tasks.length === 0 ? <Empty>暂无运营SOP任务，请先启动校区执行或手动新建任务。</Empty> : null}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          {canManage ? <SopExecutionForm templateId={template.id} campuses={campuses} /> : null}
          <SopTaskForm templateId={template.id} campuses={campuses} executions={executionOptions} />
          {canInspect ? <SopInspectionForm templateId={template.id} executions={executionOptions} /> : null}
          <SopWeeklyReportForm templateId={template.id} campuses={campuses} executions={executionOptions} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="SOP 完成度看板">
          <div className="divide-y divide-line">
            {executions.map((item) => (
              <div key={item.id} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-ink">{item.campus.name}</div>
                    <div className="mt-1 text-sm text-muted">责任人：{item.owner} / 任务 {item._count.tasks}</div>
                  </div>
                  <div className="text-lg font-semibold text-brand-700">{item.progress}%</div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[#EEF2F4]">
                  <div className="h-2 rounded-full bg-brand-600" style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }} />
                </div>
              </div>
            ))}
            {executions.length === 0 ? <Empty>暂无运营SOP执行看板数据。</Empty> : null}
          </div>
        </Panel>

        <Panel title="总部检查表">
          <div className="divide-y divide-line">
            {inspections.map((item) => (
              <div key={item.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-ink">{item.execution?.campus.name || "文档检查"}</div>
                  <div className="inline-flex items-center gap-1 text-brand-700">
                    <ShieldCheck className="h-4 w-4" />
                    {item.score}
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted">{getUserDisplayName(item.inspector)} / {item.createdAt.toLocaleString("zh-CN")}</div>
                <p className="mt-2 text-sm leading-6 text-muted">{item.comment || "无检查意见"}</p>
              </div>
            ))}
            {inspections.length === 0 ? <Empty>暂无总部检查评分。</Empty> : null}
          </div>
        </Panel>
      </section>

      <Panel title="校区周报">
        <div className="divide-y divide-line">
          {weeklyReports.map((item) => (
            <div key={item.id} className="p-5">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-semibold text-ink">{item.campus.name} · {item.weekStart.toLocaleDateString("zh-CN")}</div>
                  <div className="mt-1 text-xs text-muted">提交人：{getUserDisplayName(item.reporter)} / 责任人：{item.execution?.owner || "-"}</div>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">{item.summary}</p>
              {item.blockers ? <p className="mt-2 text-sm leading-6 text-muted">阻塞：{item.blockers}</p> : null}
              {item.nextPlan ? <p className="mt-2 text-sm leading-6 text-muted">下周计划：{item.nextPlan}</p> : null}
            </div>
          ))}
          {weeklyReports.length === 0 ? <Empty>暂无校区周报。</Empty> : null}
        </div>
      </Panel>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md bg-brand-50 px-2 py-1 text-brand-700">{children}</span>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-line px-4 py-2"><div className="text-xs text-muted">{label}</div><div className="text-lg font-semibold text-ink">{value}</div></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="overflow-hidden rounded-lg border border-line bg-white"><div className="border-b border-line px-5 py-4 font-semibold text-ink">{title}</div>{children}</section>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="p-8 text-center text-sm text-muted">{children}</div>;
}

function Status({ status }: { status: keyof typeof sopLabels.taskStatus }) {
  const tone = {
    TODO: "bg-[#F2F4F7] text-muted",
    IN_PROGRESS: "bg-brand-50 text-brand-700",
    DONE: "bg-emerald-50 text-emerald-700",
    BLOCKED: "bg-red-50 text-red-700"
  }[status];
  return <span className={`rounded-md px-2 py-1 text-xs ${tone}`}>{sopLabels.taskStatus[status]}</span>;
}

function toDateTimeLocal(date: Date | null) {
  if (!date) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
