import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api";
import { buildAnalyticsWhere, buildClassWhere, buildDailyReport, computeAnalytics, parseAnalyticsFilters } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireApiUser("/analytics");
  if ("response" in auth) return auth.response;
  const items = await prisma.analyticsDailyReport.findMany({ orderBy: { reportDate: "desc" }, take: 30 });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/analytics");
  if ("response" in auth) return auth.response;
  const filters = parseAnalyticsFilters(new URL(request.url).searchParams);
  const { leadWhere, studentWhere, attendanceWhere } = buildAnalyticsWhere(auth.user, filters);
  const [leads, students, attendance, classCount] = await Promise.all([
    prisma.lead.findMany({ where: leadWhere, include: { campus: { select: { name: true } }, assignee: { select: { name: true } } } }),
    prisma.student.findMany({ where: studentWhere, include: { campus: { select: { name: true } }, class: { select: { name: true } }, salesOwner: { select: { name: true } } } }),
    prisma.attendanceRecord.findMany({ where: attendanceWhere, include: { courseSession: { select: { homework: true, class: { select: { id: true, name: true } } } } } }),
    prisma.studentClass.count({ where: buildClassWhere(auth.user, filters) })
  ]);
  const report = buildDailyReport(computeAnalytics({ leads, students, attendance, classCount }));
  const item = await prisma.analyticsDailyReport.upsert({
    where: { reportDate: report.reportDate },
    update: { title: report.title, summary: report.summary, metrics: report.metrics },
    create: report
  });
  return NextResponse.json({ item });
}
