import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api";
import { buildAnalyticsWhere, buildCourseSessionWhere, buildWrongQuestionWhere, computeAnalytics, parseAnalyticsFilters } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser("/analytics");
  if ("response" in auth) return auth.response;
  const filters = parseAnalyticsFilters(new URL(request.url).searchParams);
  const { leadWhere, studentWhere, attendanceWhere } = buildAnalyticsWhere(auth.user, filters);
  const [leads, students, attendance, courseSessions, wrongQuestionRecords] = await Promise.all([
    prisma.lead.findMany({ where: leadWhere, include: { campus: { select: { name: true } }, assignee: { select: { name: true } } } }),
    prisma.student.findMany({ where: studentWhere, include: { campus: { select: { name: true } }, class: { select: { name: true } }, salesOwner: { select: { name: true } } } }),
    prisma.attendanceRecord.findMany({ where: attendanceWhere, include: { courseSession: { select: { homework: true, class: { select: { id: true, name: true } } } } } }),
    prisma.courseSession.findMany({ where: buildCourseSessionWhere(auth.user, filters), select: { startsAt: true, endsAt: true } }),
    prisma.wrongQuestionRecord.findMany({
      where: buildWrongQuestionWhere(auth.user, filters),
      include: { question: { select: { subject: true, chapter: true, knowledgePoint: true, difficulty: true } } }
    })
  ]);
  const summary = computeAnalytics({ leads, students, attendance, courseSessions, wrongQuestionRecords });
  const xlsx = await import("xlsx");
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet([summary.overview]), "经营概览");
  xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(summary.channelRows), "渠道转化");
  xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(summary.campusRows), "校区业绩");
  xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(summary.counselorRows), "招生老师");
  xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(summary.classRows), "班级服务");
  xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(summary.weakKnowledgeRows), "薄弱知识点");
  const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = new Uint8Array(buffer);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="analytics-${new Date().toISOString().slice(0, 10)}.xlsx"`
    }
  });
}
