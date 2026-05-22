import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api";
import { buildAnalyticsWhere, buildClassWhere, buildTrendRows, computeAnalytics, parseAnalyticsFilters } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser("/analytics");
  if ("response" in auth) return auth.response;

  const filters = parseAnalyticsFilters(new URL(request.url).searchParams);
  const { leadWhere, studentWhere, attendanceWhere } = buildAnalyticsWhere(auth.user, filters);
  const [leads, students, attendance, classCount] = await Promise.all([
    prisma.lead.findMany({
      where: leadWhere,
      include: {
        campus: { select: { name: true } },
        assignee: { select: { name: true } }
      }
    }),
    prisma.student.findMany({
      where: studentWhere,
      include: {
        campus: { select: { name: true } },
        class: { select: { name: true } },
        salesOwner: { select: { name: true } }
      }
    }),
    prisma.attendanceRecord.findMany({
      where: attendanceWhere,
      include: {
        courseSession: { select: { homework: true, class: { select: { id: true, name: true } } } }
      }
    }),
    prisma.studentClass.count({
      where: buildClassWhere(auth.user, filters)
    })
  ]);

  const summary = computeAnalytics({ leads, students, attendance, classCount });
  const trends = buildTrendRows(leads, students, filters.from, filters.to);
  return NextResponse.json({ filters, ...summary, trends });
}
