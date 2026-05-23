import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildPerformanceRows } from "@/lib/crm";
import { buildCrmLeadScopeWhere, buildScopedUserWhere } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiUser("/crm");
    if ("response" in auth) return auth.response;

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const campusId = searchParams.get("campusId");

    const leadWhere: Prisma.LeadWhereInput = { AND: [await buildCrmLeadScopeWhere(auth.user)] };
    if (campusId) leadWhere.AND = [...(leadWhere.AND as Prisma.LeadWhereInput[]), { campusId }];
    if (from || to) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (from) createdAt.gte = new Date(from);
      if (to) createdAt.lte = new Date(to);
      leadWhere.AND = [...(leadWhere.AND as Prisma.LeadWhereInput[]), { createdAt }];
    }

    const userWhere: Prisma.UserWhereInput = campusId
      ? { ...(await buildScopedUserWhere(auth.user, "ADMISSIONS_COUNSELOR")), campusId }
      : await buildScopedUserWhere(auth.user, "ADMISSIONS_COUNSELOR");

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
