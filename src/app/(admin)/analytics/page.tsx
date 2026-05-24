import { BarChart3 } from "lucide-react";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { buildAnalyticsCourseSessionWhere, buildAnalyticsWhere, buildAnalyticsWrongQuestionWhere, buildTrendRows, computeAnalytics, parseAnalyticsFilters } from "@/lib/analytics";
import { buildAccessibleCampusWhere, buildScopedUserWhere } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function AnalyticsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser("/analytics");
  const params = await searchParams;
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") urlParams.set(key, value);
  }
  const filters = parseAnalyticsFilters(urlParams);
  const { leadWhere, studentWhere, attendanceWhere } = await buildAnalyticsWhere(user, filters);
  const courseSessionWhere = await buildAnalyticsCourseSessionWhere(user, filters);
  const wrongQuestionWhere = await buildAnalyticsWrongQuestionWhere(user, filters);
  const campusWhere = await buildAccessibleCampusWhere(user, { activeOnly: true });
  const counselorWhere = filters.campusId
    ? { ...(await buildScopedUserWhere(user, "ADMISSIONS_COUNSELOR")), campusId: filters.campusId }
    : await buildScopedUserWhere(user, "ADMISSIONS_COUNSELOR");

  const [leads, students, attendance, courseSessions, wrongQuestionRecords, campuses, counselors, reports] = await Promise.all([
    prisma.lead.findMany({ where: leadWhere, include: { campus: { select: { name: true } }, assignee: { select: { name: true, phone: true } } } }),
    prisma.student.findMany({ where: studentWhere, include: { campus: { select: { name: true } }, class: { select: { name: true } }, salesOwner: { select: { name: true, phone: true } } } }),
    prisma.attendanceRecord.findMany({ where: attendanceWhere, include: { courseSession: { select: { homework: true, class: { select: { id: true, name: true } } } } } }),
    prisma.courseSession.findMany({ where: courseSessionWhere, select: { startsAt: true, endsAt: true } }),
    prisma.wrongQuestionRecord.findMany({
      where: wrongQuestionWhere,
      include: { question: { select: { subject: true, chapter: true, knowledgePoint: true, difficulty: true } } }
    }),
    prisma.campus.findMany({ where: campusWhere, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: counselorWhere, select: { id: true, name: true, phone: true }, orderBy: { name: "asc" } }),
    prisma.analyticsDailyReport.findMany({ orderBy: { reportDate: "desc" }, take: 5 })
  ]);

  const computed = computeAnalytics({ leads, students, attendance, courseSessions, wrongQuestionRecords });
  const summary = { ...computed, trends: buildTrendRows(leads, students, filters.from, filters.to) };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink">数据中心</h1>
            <p className="mt-2 text-sm text-muted">汇总总部、校区、招生、教务、财务和趋势分析数据。</p>
          </div>
        </div>
      </section>

      <AnalyticsDashboard summary={JSON.parse(JSON.stringify(summary))} campuses={campuses} counselors={counselors} />

      <section className="rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-4 font-semibold text-ink">最近经营日报</div>
        <div className="divide-y divide-line">
          {reports.map((report) => (
            <div key={report.id} className="p-5">
              <div className="font-semibold text-ink">{report.title}</div>
              <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{report.summary}</pre>
            </div>
          ))}
          {reports.length === 0 ? <div className="p-8 text-center text-sm text-muted">暂无日报</div> : null}
        </div>
      </section>
    </div>
  );
}
