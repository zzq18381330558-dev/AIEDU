import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { computeCompletionRate, normalizeSopCheckInInput, sopTaskScopeWhere } from "@/lib/sop";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
    const input = normalizeSopCheckInInput(body);
    const item = await prisma.$transaction(async (tx) => {
      const checkIn = await tx.sopTaskCheckIn.create({
        data: {
          taskId: id,
          userId: auth.user.id,
          note: input.note,
          evidence: input.evidence
        },
        include: { user: { select: { id: true, name: true, phone: true } } }
      });
      await tx.sopTask.update({
        where: { id },
        data: {
          status: input.status,
          completedAt: input.status === "DONE" ? new Date() : null
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
      return checkIn;
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
