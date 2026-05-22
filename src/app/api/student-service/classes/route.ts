import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { classScopeWhere, normalizeClassInput } from "@/lib/student-service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;

  const items = await prisma.studentClass.findMany({
    where: classScopeWhere(auth.user),
    include: {
      campus: { select: { id: true, name: true } },
      academicOwner: { select: { id: true, name: true } },
      lecturer: { select: { id: true, name: true } },
      _count: { select: { students: true, sessions: true } }
    },
    orderBy: { startAt: "desc" }
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;
  if (auth.user.role === "ADMISSIONS_COUNSELOR") {
    return NextResponse.json({ error: "招生老师无权新建班级" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const item = await prisma.studentClass.create({
      data: normalizeClassInput(body, { campusId: auth.user.campusId || String(body.campusId || "") }),
      include: {
        campus: { select: { id: true, name: true } },
        academicOwner: { select: { id: true, name: true } },
        lecturer: { select: { id: true, name: true } },
        _count: { select: { students: true, sessions: true } }
      }
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
