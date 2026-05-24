import { NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { getTodayRange } from "@/lib/crm";
import { buildCrmLeadScopeWhere } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await requireApiUser("/crm");
    if ("response" in auth) return auth.response;

    const { start, end } = getTodayRange();
    const scope = await buildCrmLeadScopeWhere(auth.user);
    const items = await prisma.lead.findMany({
      where: {
        AND: [scope, { nextFollowUpAt: { gte: start, lt: end } }]
      },
      include: {
        campus: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, phone: true } }
      },
      orderBy: { nextFollowUpAt: "asc" },
      take: 100
    });

    return NextResponse.json({ items });
  } catch (error) {
    return jsonError(error, 500);
  }
}
