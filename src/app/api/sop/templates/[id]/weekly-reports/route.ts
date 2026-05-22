import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeSopWeeklyReportInput, sopCampusWhere } from "@/lib/sop";
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
