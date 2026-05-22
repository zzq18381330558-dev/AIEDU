import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { leadScopeWhere, normalizeLeadUpdateInput } from "@/lib/crm";
import { prisma } from "@/lib/prisma";

const include = {
  campus: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true } },
  creator: { select: { id: true, name: true } },
  _count: { select: { followUps: true } }
};

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/crm");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  const lead = await prisma.lead.findFirst({
    where: { id, ...leadScopeWhere(auth.user) },
    include
  });

  if (!lead) return NextResponse.json({ error: "线索不存在" }, { status: 404 });
  return NextResponse.json({ item: lead });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/crm");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  try {
    const exists = await prisma.lead.findFirst({
      where: { id, ...leadScopeWhere(auth.user) },
      select: { id: true }
    });
    if (!exists) return NextResponse.json({ error: "线索不存在" }, { status: 404 });

    const body = await request.json();
    const lead = await prisma.lead.update({
      where: { id },
      data: normalizeLeadUpdateInput(body),
      include
    });
    return NextResponse.json({ item: lead });
  } catch (error) {
    return jsonError(error);
  }
}
