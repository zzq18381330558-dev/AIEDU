import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildAnalyticsWhere, buildCourseSessionWhere, buildDailyReport, buildWrongQuestionWhere, computeAnalytics, parseAnalyticsFilters } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await requireApiUser("/analytics");
    if ("response" in auth) return auth.response;
    const items = await prisma.analyticsDailyReport.findMany({ orderBy: { reportDate: "desc" }, take: 30 });
    return NextResponse.json({ items });
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiUser("/analytics");
    if ("response" in auth) return auth.response;
    const filters = parseAnalyticsFilters(new URL(request.url).searchParams);
    const { leadWhere, studentWhere, attendanceWhere } = buildAnalyticsWhere(auth.user, filters);
    const [leads, students, attendance, courseSessions, wrongQuestionRecords] = await Promise.all([
      prisma.lead.findMany({ where: leadWhere, include: { campus: { select: { name: true } }, assignee: { select: { name: true, email: true, phone: true } } } }),
      prisma.student.findMany({ where: studentWhere, include: { campus: { select: { name: true } }, class: { select: { name: true } }, salesOwner: { select: { name: true, email: true, phone: true } } } }),
      prisma.attendanceRecord.findMany({ where: attendanceWhere, include: { courseSession: { select: { homework: true, class: { select: { id: true, name: true } } } } } }),
      prisma.courseSession.findMany({ where: buildCourseSessionWhere(auth.user, filters), select: { startsAt: true, endsAt: true } }),
      prisma.wrongQuestionRecord.findMany({
        where: buildWrongQuestionWhere(auth.user, filters),
        include: { question: { select: { subject: true, chapter: true, knowledgePoint: true, difficulty: true } } }
      })
    ]);
    const report = buildDailyReport(computeAnalytics({ leads, students, attendance, courseSessions, wrongQuestionRecords }));
    const item = await prisma.analyticsDailyReport.upsert({
      where: { reportDate: report.reportDate },
      update: { title: report.title, summary: report.summary, metrics: report.metrics },
      create: report
    });
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error, 500);
  }
}
