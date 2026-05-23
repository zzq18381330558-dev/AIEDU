import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { canInspectSop, normalizeSopInspectionInput, sopExecutionScopeWhere } from "@/lib/sop";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/sop");
  if ("response" in auth) return auth.response;
  if (!canInspectSop(auth.user.role)) return NextResponse.json({ error: "无权提交总部检查" }, { status: 403 });
  const { id } = await context.params;

  try {
    const body = await request.json();
    const input = normalizeSopInspectionInput(body);
    const template = await prisma.sopTemplate.findUnique({ where: { id }, select: { id: true } });
    if (!template) return NextResponse.json({ error: "运营SOP不存在" }, { status: 404 });
    if (input.sopExecutionId) {
      const execution = await prisma.sopExecution.findFirst({
        where: { id: input.sopExecutionId, sopTemplateId: id, ...sopExecutionScopeWhere(auth.user) },
        select: { id: true }
      });
      if (!execution) return NextResponse.json({ error: "检查对象不存在或无权限" }, { status: 404 });
    }
    const item = await prisma.sopInspection.create({
      data: {
        sopTemplateId: id,
        inspectorId: auth.user.id,
        ...input
      },
      include: {
        inspector: { select: { id: true, name: true, email: true, phone: true } },
        execution: { include: { campus: { select: { id: true, name: true } } } }
      }
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
