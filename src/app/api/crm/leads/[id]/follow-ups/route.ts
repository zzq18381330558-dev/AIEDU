import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { leadScopeWhere, normalizeFollowUpInput } from "@/lib/crm";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/crm");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  const lead = await prisma.lead.findFirst({
    where: { id, ...leadScopeWhere(auth.user) },
    select: { id: true }
  });
  if (!lead) return NextResponse.json({ error: "线索不存在" }, { status: 404 });

  const items = await prisma.leadFollowUp.findMany({
    where: { leadId: id },
    include: {
      creator: { select: { id: true, name: true } }
    },
    orderBy: { followAt: "desc" }
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/crm");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  try {
    const lead = await prisma.lead.findFirst({
      where: { id, ...leadScopeWhere(auth.user) },
      select: { id: true }
    });
    if (!lead) return NextResponse.json({ error: "线索不存在" }, { status: 404 });

    const body = await request.json();
    const data = normalizeFollowUpInput(body);
    const item = await prisma.$transaction(async (tx) => {
      const followUp = await tx.leadFollowUp.create({
        data: {
          leadId: id,
          creatorId: auth.user.id,
          ...data
        },
        include: { creator: { select: { id: true, name: true } } }
      });
      await tx.lead.update({
        where: { id },
        data: {
          status: data.status,
          intentLevel: data.intentLevel,
          lastFollowedAt: new Date(),
          nextFollowUpAt: data.nextAt
        }
      });
      return followUp;
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
