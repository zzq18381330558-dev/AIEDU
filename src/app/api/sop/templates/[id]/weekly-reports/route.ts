import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeSopWeeklyReportInput, sopCampusWhere, sopExecutionScopeWhere } from "@/lib/sop";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/sop");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  try {
    const body = await request.json();
    const input = normalizeSopWeeklyReportInput(body);
    const campus = await prisma.campus.findFirst({
      where: { id: input.campusId, ...sopCampusWhere(auth.user) },
      select: { id: true }
    });
    if (!campus) return NextResponse.json({ error: "校区不存在或无权限" }, { status: 404 });
    const template = await prisma.sopTemplate.findUnique({ where: { id }, select: { id: true } });
    if (!template) return NextResponse.json({ error: "运营SOP不存在" }, { status: 404 });
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

    const item = await prisma.sopWeeklyReport.create({
      data: {
        sopTemplateId: id,
        reporterId: auth.user.id,
        ...input
      },
      include: {
        campus: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true } },
        execution: { select: { id: true, owner: true } }
      }
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
