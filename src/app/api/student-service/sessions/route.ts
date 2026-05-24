import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeSessionInput } from "@/lib/student-service";
import { buildClassScopeWhere, buildCourseSessionScopeWhere, buildScopedUserWhere, canAccessCampusId } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;

  const items = await prisma.courseSession.findMany({
    where: await buildCourseSessionScopeWhere(auth.user),
    include: {
      class: { select: { id: true, name: true } },
      campus: { select: { id: true, name: true } },
      lecturer: { select: { id: true, name: true, email: true, phone: true } },
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
    if (!(await canAccessCampusId(auth.user, data.campusId, { activeOnly: true }))) {
      return NextResponse.json({ error: "无权限操作该校区数据" }, { status: 403 });
    }
    const studentClass = await prisma.studentClass.findFirst({
      where: { AND: [{ id: data.classId }, await buildClassScopeWhere(auth.user)] },
      select: { id: true, campusId: true }
    });
    if (!studentClass) throw new Error("班级不存在或无权排课");
    if (studentClass.campusId !== data.campusId) throw new Error("课程校区必须与班级校区一致");
    if (data.lecturerId) {
      const lecturer = await prisma.user.findFirst({
        where: { AND: [{ id: data.lecturerId }, await buildScopedUserWhere(auth.user, "LECTURER")] },
        select: { id: true, campusId: true }
      });
      if (!lecturer) throw new Error("授课老师不存在或无权限");
      if (lecturer.campusId && lecturer.campusId !== data.campusId) throw new Error("授课老师不属于所选校区");
    }
    const item = await prisma.courseSession.create({
      data
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
