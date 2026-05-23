import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeSopExecutionInput, sopCampusWhere } from "@/lib/sop";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/sop");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  try {
    const body = await request.json();
    const input = normalizeSopExecutionInput(body);
    const campus = await prisma.campus.findFirst({
      where: { AND: [{ id: input.campusId }, sopCampusWhere(auth.user)] },
      select: { id: true }
    });
    if (!campus) return NextResponse.json({ error: "校区不存在或无权限" }, { status: 404 });

    const template = await prisma.sopTemplate.findUnique({
      where: { id },
      include: { steps: { orderBy: { sortOrder: "asc" } } }
    });
    if (!template || template.status === "RETIRED") {
      return NextResponse.json({ error: "SOP 不存在或已停用" }, { status: 404 });
    }

    const item = await prisma.$transaction(async (tx) => {
      const execution = await tx.sopExecution.create({
        data: {
          sopTemplateId: id,
          campusId: input.campusId,
          owner: input.owner,
          progress: 0
        },
        include: { campus: { select: { id: true, name: true } } }
      });
      if (template.steps.length) {
        await tx.sopTask.createMany({
          data: template.steps.map((step) => ({
            sopTemplateId: id,
            sopExecutionId: execution.id,
            campusId: input.campusId,
            title: step.title,
            description: step.standard || step.description
          }))
        });
      }
      return execution;
    });

    return NextResponse.json({ item, taskCount: template.steps.length }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
