import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { classScopeWhere, normalizeSessionInput } from "@/lib/student-service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;

  const items = await prisma.courseSession.findMany({
    where: { class: classScopeWhere(auth.user) },
    include: {
      class: { select: { id: true, name: true } },
      campus: { select: { id: true, name: true } },
      lecturer: { select: { id: true, name: true } },
      _count: { select: { attendanceRecords: true, reminders: true } }
    },
    orderBy: { startsAt: "asc" },
    take: 200
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;
  if (auth.user.role === "ADMISSIONS_COUNSELOR") {
    return NextResponse.json({ error: "招生老师无权新建课程" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = normalizeSessionInput(body, { campusId: auth.user.campusId || String(body.campusId || "") });
    const studentClass = await prisma.studentClass.findFirst({
      where: { id: data.classId, ...classScopeWhere(auth.user) },
      select: { id: true, campusId: true }
    });
    if (!studentClass) throw new Error("班级不存在或无权排课");
    if (studentClass.campusId !== data.campusId) throw new Error("课程校区必须与班级校区一致");
    const item = await prisma.courseSession.create({
      data
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
