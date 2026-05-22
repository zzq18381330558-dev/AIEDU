import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { canInspectSop, normalizeSopInspectionInput } from "@/lib/sop";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/sop");
  if ("response" in auth) return auth.response;
  if (!canInspectSop(auth.user.role)) return NextResponse.json({ error: "无权提交总部检查" }, { status: 403 });
  const { id } = await context.params;

  try {
    const body = await request.json();
    const input = normalizeSopInspectionInput(body);
    const item = await prisma.sopInspection.create({
      data: {
        sopTemplateId: id,
        inspectorId: auth.user.id,
        ...input
      },
      include: {
        inspector: { select: { id: true, name: true } },
        execution: { include: { campus: { select: { id: true, name: true } } } }
      }
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
