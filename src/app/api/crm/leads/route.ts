import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeLeadInput, leadScopeWhere, getTodayRange } from "@/lib/crm";
import { prisma } from "@/lib/prisma";

const leadInclude = {
  campus: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true } },
  creator: { select: { id: true, name: true } },
  _count: { select: { followUps: true } }
} satisfies Prisma.LeadInclude;

export async function GET(request: NextRequest) {
  const auth = await requireApiUser("/crm");
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const where: Prisma.LeadWhereInput = {
    ...leadScopeWhere(auth.user)
  };

  const search = searchParams.get("search")?.trim();
  if (search) {
    where.OR = [
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

  if (campusId) where.campusId = campusId;
  if (assigneeId) where.assigneeId = assigneeId;
  if (status) where.status = status as Prisma.EnumLeadStatusFilter["equals"];
  if (sourceChannel) where.sourceChannel = sourceChannel as Prisma.EnumLeadSourceChannelFilter["equals"];
  if (intentLevel) where.intentLevel = intentLevel as Prisma.EnumLeadIntentLevelFilter["equals"];
  if (due === "today") {
    const { start, end } = getTodayRange();
    where.nextFollowUpAt = { gte: start, lt: end };
  }

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
      where: leadScopeWhere(auth.user),
      _count: { _all: true }
    }),
    prisma.lead.groupBy({
      by: ["sourceChannel"],
      where: leadScopeWhere(auth.user),
      _count: { _all: true }
    }),
    prisma.lead.count({
      where: {
        ...leadScopeWhere(auth.user),
        nextFollowUpAt: { gte: todayRange.start, lt: todayRange.end }
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
    const lead = await prisma.lead.create({
      data,
      include: leadInclude
    });
    return NextResponse.json({ item: lead }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
