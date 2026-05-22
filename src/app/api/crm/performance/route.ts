import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildPerformanceRows, leadScopeWhere } from "@/lib/crm";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiUser("/crm");
    if ("response" in auth) return auth.response;

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const campusId = searchParams.get("campusId");

    const leadWhere: Prisma.LeadWhereInput = { ...leadScopeWhere(auth.user) };
    if (campusId) leadWhere.campusId = campusId;
    if (from || to) {
      leadWhere.createdAt = {};
      if (from) leadWhere.createdAt.gte = new Date(from);
      if (to) leadWhere.createdAt.lte = new Date(to);
    }

    const userWhere: Prisma.UserWhereInput = {
      role: "ADMISSIONS_COUNSELOR",
      status: "ACTIVE"
    };
    if (auth.user.role === "CAMPUS_MANAGER" && auth.user.campusId) userWhere.campusId = auth.user.campusId;
    if (auth.user.role === "ADMISSIONS_COUNSELOR") userWhere.id = auth.user.id;
    if (campusId) userWhere.campusId = campusId;

    const [users, leads, sourceGroups] = await Promise.all([
      prisma.user.findMany({
        where: userWhere,
        include: { campus: { select: { name: true } } },
        orderBy: { name: "asc" }
      }),
      prisma.lead.findMany({
        where: leadWhere,
        select: { assigneeId: true, status: true, createdAt: true }
      }),
      prisma.lead.groupBy({
        by: ["sourceChannel"],
        where: leadWhere,
        _count: { _all: true }
      })
    ]);

    return NextResponse.json({
      rows: buildPerformanceRows(users, leads),
      sourceGroups
    });
  } catch (error) {
    return jsonError(error, 500);
  }
}
