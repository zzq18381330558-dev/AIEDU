import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeSopTaskInput, sopCampusWhere } from "@/lib/sop";
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

    const item = await prisma.sopTask.create({
      data: input,
      include: {
        campus: { select: { id: true, name: true } },
        execution: { select: { id: true, owner: true } },
        _count: { select: { checkIns: true } }
      }
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
