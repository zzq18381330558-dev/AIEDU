import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeStudentStatusInput, studentScopeWhere } from "@/lib/student-service";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  const item = await prisma.student.findFirst({
    where: { id, ...studentScopeWhere(auth.user) },
    include: {
      campus: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
      academicOwner: { select: { id: true, name: true } },
      salesOwner: { select: { id: true, name: true } },
      lead: { select: { id: true, sourceChannel: true, status: true, intentLevel: true, note: true, createdAt: true } }
    }
  });

  if (!item) return NextResponse.json({ error: "学员不存在" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;
  if (auth.user.role === "ADMISSIONS_COUNSELOR") {
    return NextResponse.json({ error: "招生老师无权维护学员状态" }, { status: 403 });
  }
  const { id } = await context.params;

  try {
    const exists = await prisma.student.findFirst({
      where: { id, ...studentScopeWhere(auth.user) },
      select: { id: true }
    });
    if (!exists) return NextResponse.json({ error: "学员不存在" }, { status: 404 });

    const body = await request.json();
    const item = await prisma.student.update({
      where: { id },
      data: normalizeStudentStatusInput(body),
      include: {
        campus: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        academicOwner: { select: { id: true, name: true } },
        salesOwner: { select: { id: true, name: true } }
      }
    });
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}
