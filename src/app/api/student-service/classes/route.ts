import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeClassInput } from "@/lib/student-service";
import { buildAccessibleCampusWhere, buildClassScopeWhere, buildScopedUserWhere, canAccessCampusId } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;

  const items = await prisma.studentClass.findMany({
    where: await buildClassScopeWhere(auth.user),
    include: {
      campus: { select: { id: true, name: true } },
      academicOwner: { select: { id: true, name: true, email: true, phone: true } },
      lecturer: { select: { id: true, name: true, email: true, phone: true } },
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
    const data = normalizeClassInput(body, { campusId: auth.user.campusId || String(body.campusId || "") });
    if (!(await canAccessCampusId(auth.user, data.campusId, { activeOnly: true }))) {
      return NextResponse.json({ error: "无权限操作该校区数据" }, { status: 403 });
    }
    const campus = await prisma.campus.findFirst({
      where: { AND: [{ id: data.campusId }, await buildAccessibleCampusWhere(auth.user, { activeOnly: true })] },
      select: { id: true }
    });
    if (!campus) return NextResponse.json({ error: "校区不存在或无权限" }, { status: 404 });
    if (data.academicOwnerId) {
      const academicOwner = await prisma.user.findFirst({
        where: { AND: [{ id: data.academicOwnerId }, await buildScopedUserWhere(auth.user, "ACADEMIC_TEACHER")] },
        select: { id: true, campusId: true }
      });
      if (!academicOwner) throw new Error("教务老师不存在或无权限");
      if (academicOwner.campusId && academicOwner.campusId !== data.campusId) throw new Error("教务老师不属于所选校区");
    }
    if (data.lecturerId) {
      const lecturer = await prisma.user.findFirst({
        where: { AND: [{ id: data.lecturerId }, await buildScopedUserWhere(auth.user, "LECTURER")] },
        select: { id: true, campusId: true }
      });
      if (!lecturer) throw new Error("授课老师不存在或无权限");
      if (lecturer.campusId && lecturer.campusId !== data.campusId) throw new Error("授课老师不属于所选校区");
    }
    const item = await prisma.studentClass.create({
      data,
      include: {
        campus: { select: { id: true, name: true } },
        academicOwner: { select: { id: true, name: true, email: true, phone: true } },
        lecturer: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { students: true, sessions: true } }
      }
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
