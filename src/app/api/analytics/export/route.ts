import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildAnalyticsCourseSessionWhere, buildAnalyticsWhere, buildAnalyticsWrongQuestionWhere, computeAnalytics, parseAnalyticsFilters } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiUser("/analytics");
    if ("response" in auth) return auth.response;
    const filters = parseAnalyticsFilters(new URL(request.url).searchParams);
    const { leadWhere, studentWhere, attendanceWhere } = await buildAnalyticsWhere(auth.user, filters);
    const [leads, students, attendance, courseSessions, wrongQuestionRecords] = await Promise.all([
      prisma.lead.findMany({ where: leadWhere, include: { campus: { select: { name: true } }, assignee: { select: { name: true, phone: true } } } }),
      prisma.student.findMany({ where: studentWhere, include: { campus: { select: { name: true } }, class: { select: { name: true } }, salesOwner: { select: { name: true, phone: true } } } }),
      prisma.attendanceRecord.findMany({ where: attendanceWhere, include: { courseSession: { select: { homework: true, class: { select: { id: true, name: true } } } } } }),
      prisma.courseSession.findMany({ where: await buildAnalyticsCourseSessionWhere(auth.user, filters), select: { startsAt: true, endsAt: true } }),
      prisma.wrongQuestionRecord.findMany({
        where: await buildAnalyticsWrongQuestionWhere(auth.user, filters),
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
    const body = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="analytics-${new Date().toISOString().slice(0, 10)}.xlsx"`
      }
    });
  } catch (error) {
    return jsonError(error, 500);
  }
}
