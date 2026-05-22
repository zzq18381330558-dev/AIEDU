import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { computeCompletionRate, normalizeSopTaskInput, sopCampusWhere, sopExecutionScopeWhere } from "@/lib/sop";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/sop");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  try {
    const body = await request.json();
    const input = normalizeSopTaskInput(body, { sopTemplateId: id });
    const campus = await prisma.campus.findFirst({
      where: { id: input.campusId, ...sopCampusWhere(auth.user) },
      select: { id: true }
    });
    if (!campus) return NextResponse.json({ error: "校区不存在或无权限" }, { status: 404 });

    if (input.sopExecutionId) {
      const execution = await prisma.sopExecution.findFirst({
        where: {
          id: input.sopExecutionId,
          sopTemplateId: id,
          campusId: input.campusId,
          ...sopExecutionScopeWhere(auth.user)
        },
        select: { id: true }
      });
      if (!execution) return NextResponse.json({ error: "关联执行不存在、校区不一致或无权限" }, { status: 404 });
    }

    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.sopTask.create({
        data: input,
        include: {
          campus: { select: { id: true, name: true } },
          execution: { select: { id: true, owner: true } },
          _count: { select: { checkIns: true } }
        }
      });
      if (input.sopExecutionId) {
        const [total, done] = await Promise.all([
          tx.sopTask.count({ where: { sopExecutionId: input.sopExecutionId } }),
          tx.sopTask.count({ where: { sopExecutionId: input.sopExecutionId, status: "DONE" } })
        ]);
        await tx.sopExecution.update({
          where: { id: input.sopExecutionId },
          data: { progress: Math.round(computeCompletionRate(done, total)) }
        });
      }
      return created;
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
