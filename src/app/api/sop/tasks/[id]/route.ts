import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { computeCompletionRate, normalizeSopTaskUpdateInput, sopTaskScopeWhere } from "@/lib/sop";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/sop");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  try {
    const task = await prisma.sopTask.findFirst({
      where: { AND: [{ id }, sopTaskScopeWhere(auth.user)] },
      select: { id: true, sopExecutionId: true }
    });
    if (!task) return NextResponse.json({ error: "任务不存在或无权限" }, { status: 404 });

    const body = await request.json();
    const input = normalizeSopTaskUpdateInput(body);
    const item = await prisma.$transaction(async (tx) => {
      const updated = await tx.sopTask.update({
        where: { id },
        data: input,
        include: {
          campus: { select: { id: true, name: true } },
          execution: { select: { id: true, owner: true } },
          _count: { select: { checkIns: true } }
        }
      });
      if (task.sopExecutionId) {
        const [total, done] = await Promise.all([
          tx.sopTask.count({ where: { sopExecutionId: task.sopExecutionId } }),
          tx.sopTask.count({ where: { sopExecutionId: task.sopExecutionId, status: "DONE" } })
        ]);
        await tx.sopExecution.update({
          where: { id: task.sopExecutionId },
          data: { progress: Math.round(computeCompletionRate(done, total)) }
        });
      }
      return updated;
    });

    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}
