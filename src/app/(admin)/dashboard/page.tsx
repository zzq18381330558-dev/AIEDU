import Link from "next/link";
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  BrainCircuit,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  UsersRound
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const today = getTodayRange();
  const scopedCampusId = user.role === "CAMPUS_MANAGER" ? user.campusId : null;
  const campusWhere = scopedCampusId
    ? { campusId: scopedCampusId }
    : { campus: { organizationId: user.organizationId } };

  const leadWhere: Prisma.LeadWhereInput = campusWhere;
  const studentWhere: Prisma.StudentWhereInput = campusWhere;
  const ticketWhere: Prisma.ServiceTicketWhereInput = { student: studentWhere };
  const reminderWhere: Prisma.StudentReminderWhereInput = { student: studentWhere, status: "PENDING" };
  const sessionWhere: Prisma.CourseSessionWhereInput = {
    ...campusWhere,
    startsAt: { gte: today.start, lt: today.end }
  };
  const sopTaskWhere: Prisma.SopTaskWhereInput = scopedCampusId
    ? { campusId: scopedCampusId }
    : { campus: { organizationId: user.organizationId } };

  const [
    newLeadCount,
    todayFollowUpCount,
    wonLeadCount,
    studentCount,
    pendingReminderCount,
    openTicketCount,
    todaySessionCount,
    questionCount,
    wrongQuestionCount,
    reviewingContentCount,
    publishedContentCount,
    activeSopTaskCount,
    blockedSopTaskCount,
    latestReport
  ] = await Promise.all([
    prisma.lead.count({ where: { ...leadWhere, createdAt: { gte: today.start, lt: today.end } } }),
    prisma.lead.count({ where: { ...leadWhere, nextFollowUpAt: { gte: today.start, lt: today.end } } }),
    prisma.lead.count({ where: { ...leadWhere, status: "WON" } }),
    prisma.student.count({ where: studentWhere }),
    prisma.studentReminder.count({ where: reminderWhere }),
    prisma.serviceTicket.count({ where: { ...ticketWhere, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.courseSession.count({ where: sessionWhere }),
    prisma.question.count(),
    prisma.wrongQuestionRecord.count(),
    prisma.teachingContent.count({ where: { status: "REVIEWING", author: { organizationId: user.organizationId } } }),
    prisma.teachingContent.count({ where: { status: "PUBLISHED", author: { organizationId: user.organizationId } } }),
    prisma.sopTask.count({ where: { ...sopTaskWhere, status: { in: ["TODO", "IN_PROGRESS"] } } }),
    prisma.sopTask.count({ where: { ...sopTaskWhere, status: "BLOCKED" } }),
    prisma.analyticsDailyReport.findFirst({ orderBy: { reportDate: "desc" } })
  ]);

  const overview = [
    {
      label: "今日新增线索",
      value: String(newLeadCount),
      hint: `今日待跟进 ${todayFollowUpCount} 条`,
      href: "/crm",
      icon: UsersRound
    },
    {
      label: "学员服务",
      value: String(studentCount),
      hint: `待推送 ${pendingReminderCount} 条，开放工单 ${openTicketCount} 个`,
      href: "/student-service",
      icon: BrainCircuit
    },
    {
      label: "题库题目",
      value: String(questionCount),
      hint: `错题记录 ${wrongQuestionCount} 条`,
      href: "/question-bank",
      icon: BookOpenCheck
    },
    {
      label: "SOP 待办",
      value: String(activeSopTaskCount),
      hint: `阻塞任务 ${blockedSopTaskCount} 个`,
      href: "/sop",
      icon: ClipboardList
    }
  ];

  const quickStats = [
    { label: "累计成交线索", value: wonLeadCount, href: "/crm/performance", icon: TrendingUp },
    { label: "今日课程", value: todaySessionCount, href: "/student-service/schedule", icon: Bell },
    { label: "待审核内容", value: reviewingContentCount, href: "/content", icon: GraduationCap },
    { label: "已发布内容", value: publishedContentCount, href: "/content/campus-materials", icon: GraduationCap }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink">运营工作台</h1>
            <p className="mt-2 text-sm text-muted">
              汇总招生、教学服务、教研内容和校区复制的核心指标。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className="rounded-lg border border-line bg-white p-5 transition hover:border-brand-200 hover:shadow-soft">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted">{item.label}</div>
                <Icon className="h-4 w-4 text-brand-600" />
              </div>
              <div className="mt-4 text-3xl font-semibold text-ink">{item.value}</div>
              <div className="mt-2 text-xs text-muted">{item.hint}</div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-line bg-white">
          <div className="border-b border-line px-5 py-4 font-semibold text-ink">今日经营快照</div>
          <div className="grid gap-0 divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0">
            {quickStats.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} className="flex items-center gap-4 p-5 hover:bg-[#FAFBFC]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-muted">{item.label}</div>
                    <div className="mt-1 text-2xl font-semibold text-ink">{item.value}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <section className="rounded-lg border border-line bg-white">
          <div className="border-b border-line px-5 py-4 font-semibold text-ink">最近经营日报</div>
          {latestReport ? (
            <div className="p-5">
              <div className="text-sm font-semibold text-ink">{latestReport.title}</div>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{latestReport.summary}</pre>
              <Link href="/analytics" className="mt-4 inline-flex h-9 items-center rounded-md border border-line px-3 text-sm text-ink">
                查看数据分析
              </Link>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted">暂无经营日报</div>
          )}
        </section>
      </section>
    </div>
  );
}

function getTodayRange(now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}
