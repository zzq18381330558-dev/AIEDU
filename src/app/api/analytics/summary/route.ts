import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { analyticsStudentSelect, buildAnalyticsCourseSessionWhere, buildAnalyticsWhere, buildAnalyticsWrongQuestionWhere, buildTrendRows, computeAnalytics, parseAnalyticsFilters } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiUser("/analytics");
    if ("response" in auth) return auth.response;

    const filters = parseAnalyticsFilters(new URL(request.url).searchParams);
    const { leadWhere, studentWhere, attendanceWhere } = await buildAnalyticsWhere(auth.user, filters);
    const [leads, students, attendance, courseSessions, wrongQuestionRecords] = await Promise.all([
      prisma.lead.findMany({
        where: leadWhere,
        include: {
          campus: { select: { name: true } },
          assignee: { select: { name: true, phone: true } }
        }
      }),
      prisma.student.findMany({
        where: studentWhere,
        select: analyticsStudentSelect
      }),
      prisma.attendanceRecord.findMany({
        where: attendanceWhere,
        include: {
          courseSession: { select: { homework: true, class: { select: { id: true, name: true } } } }
        }
      }),
      prisma.courseSession.findMany({
        where: await buildAnalyticsCourseSessionWhere(auth.user, filters),
        select: { startsAt: true, endsAt: true }
      }),
      prisma.wrongQuestionRecord.findMany({
        where: await buildAnalyticsWrongQuestionWhere(auth.user, filters),
        include: { question: { select: { subject: true, chapter: true, knowledgePoint: true, difficulty: true } } }
      })
    ]);

    const summary = computeAnalytics({ leads, students, attendance, courseSessions, wrongQuestionRecords });
    const trends = buildTrendRows(leads, students, filters.from, filters.to);
    return NextResponse.json({ filters, ...summary, trends });
  } catch (error) {
    return jsonError(error, 500);
  }
}
