import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeLeadInput, getTodayRange } from "@/lib/crm";
import { buildAccessibleCampusWhere, buildCrmLeadScopeWhere, buildScopedUserWhere, canAccessCampusId } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

const leadInclude = {
  campus: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true, phone: true } },
  creator: { select: { id: true, name: true, phone: true } },
  _count: { select: { followUps: true } }
} satisfies Prisma.LeadInclude;

export async function GET(request: NextRequest) {
  const auth = await requireApiUser("/crm");
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const scope = await buildCrmLeadScopeWhere(auth.user);
  const filters: Prisma.LeadWhereInput = {};

  const search = searchParams.get("search")?.trim();
  if (search) {
    filters.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { wechat: { contains: search, mode: "insensitive" } },
      { school: { contains: search, mode: "insensitive" } }
    ];
  }

  const campusId = searchParams.get("campusId");
  const assigneeId = searchParams.get("assigneeId");
  const status = searchParams.get("status");
  const sourceChannel = searchParams.get("sourceChannel");
  const intentLevel = searchParams.get("intentLevel");
  const due = searchParams.get("due");

  if (campusId) filters.campusId = campusId;
  if (assigneeId) filters.assigneeId = assigneeId;
  if (status) filters.status = status as Prisma.EnumLeadStatusFilter["equals"];
  if (sourceChannel) filters.sourceChannel = sourceChannel as Prisma.EnumLeadSourceChannelFilter["equals"];
  if (intentLevel) filters.intentLevel = intentLevel as Prisma.EnumLeadIntentLevelFilter["equals"];
  if (due === "today") {
    const { start, end } = getTodayRange();
    filters.nextFollowUpAt = { gte: start, lt: end };
  }
  const where: Prisma.LeadWhereInput = { AND: [scope, filters] };

  const todayRange = getTodayRange();
  const [items, total, statusGroups, sourceGroups, todayCount] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: leadInclude,
      orderBy: [{ nextFollowUpAt: "asc" }, { updatedAt: "desc" }],
      take: 100
    }),
    prisma.lead.count({ where }),
    prisma.lead.groupBy({
      by: ["status"],
      where: scope,
      _count: { _all: true }
    }),
    prisma.lead.groupBy({
      by: ["sourceChannel"],
      where: scope,
      _count: { _all: true }
    }),
    prisma.lead.count({
      where: {
        AND: [scope, { nextFollowUpAt: { gte: todayRange.start, lt: todayRange.end } }]
      }
    })
  ]);

  return NextResponse.json({ items, total, statusGroups, sourceGroups, todayCount });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/crm");
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    if (auth.user.role === "ADMISSIONS_COUNSELOR" && !body.assigneeId) {
      body.assigneeId = auth.user.id;
    }
    const defaultCampusId = auth.user.campusId || String(body.campusId || "");
    const data = normalizeLeadInput(body, {
      creatorId: auth.user.id,
      campusId: defaultCampusId
    });
    if (!(await canAccessCampusId(auth.user, data.campusId, { activeOnly: true }))) {
      return NextResponse.json({ error: "无权限操作该校区数据" }, { status: 403 });
    }
    const campusScope = await buildAccessibleCampusWhere(auth.user, { activeOnly: true });
    const campus = await prisma.campus.findFirst({
      where: { AND: [{ id: data.campusId }, campusScope] },
      select: { id: true }
    });
    if (!campus) return NextResponse.json({ error: "校区不存在或无权限" }, { status: 404 });
    if (data.assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: { AND: [{ id: data.assigneeId }, await buildScopedUserWhere(auth.user, "ADMISSIONS_COUNSELOR")] },
        select: { id: true }
      });
      if (!assignee) return NextResponse.json({ error: "招生老师不存在或无权限" }, { status: 404 });
    }
    const lead = await prisma.lead.create({
      data,
      include: leadInclude
    });
    return NextResponse.json({ item: lead }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
