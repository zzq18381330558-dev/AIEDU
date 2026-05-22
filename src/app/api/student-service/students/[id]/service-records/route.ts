import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeServiceRecordInput, studentScopeWhere } from "@/lib/student-service";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;
  if (auth.user.role === "ADMISSIONS_COUNSELOR") {
    return NextResponse.json({ error: "招生老师无权新建服务记录" }, { status: 403 });
  }
  const { id } = await context.params;

  try {
    const student = await prisma.student.findFirst({
      where: { id, ...studentScopeWhere(auth.user) },
      select: { id: true }
    });
    if (!student) return NextResponse.json({ error: "学员不存在" }, { status: 404 });

    const body = await request.json();
    const input = normalizeServiceRecordInput(body);
    const item = await prisma.serviceTicket.create({
      data: {
        studentId: id,
        ownerId: auth.user.id,
        title: input.title,
        status: input.status,
        aiSuggestion: input.content
      },
      include: { owner: { select: { id: true, name: true } } }
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
