import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildAccessibleCampusWhere, buildClassScopeWhere, buildScopedUserWhere, canAccessCampusId } from "@/lib/data-scope";
import { normalizeClassInput, validateClassCourse } from "@/lib/student-service";
import { prisma } from "@/lib/prisma";

const classInclude = {
  campus: { select: { id: true, name: true } },
  course: { select: { id: true, name: true, code: true } },
  academicOwner: { select: { id: true, name: true, phone: true } },
  lecturer: { select: { id: true, name: true, phone: true } },
  _count: { select: { students: true, sessions: true } }
};

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return updateClass(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return updateClass(request, context);
}

async function updateClass(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;
  if (auth.user.role === "ADMISSIONS_COUNSELOR") {
    return NextResponse.json({ error: "招生老师无权编辑班级" }, { status: 403 });
  }
  const { id } = await context.params;

  try {
    const exists = await prisma.studentClass.findFirst({
      where: { AND: [{ id }, await buildClassScopeWhere(auth.user)] },
      select: { id: true, campusId: true }
    });
    if (!exists) return NextResponse.json({ error: "班级不存在或无权限" }, { status: 404 });

    const body = await request.json();
    const data = normalizeClassInput(body, { campusId: exists.campusId });
    if (!(await canAccessCampusId(auth.user, data.campusId, { activeOnly: true }))) {
      return NextResponse.json({ error: "无权限操作该校区数据" }, { status: 403 });
    }
    const campus = await prisma.campus.findFirst({
      where: { AND: [{ id: data.campusId }, await buildAccessibleCampusWhere(auth.user, { activeOnly: true })] },
      select: { id: true }
    });
    if (!campus) return NextResponse.json({ error: "校区不存在或无权限" }, { status: 404 });

    await validateClassCourse(auth.user, data.campusId, data.courseId);
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

    const item = await prisma.studentClass.update({
      where: { id },
      data,
      include: classInclude
    });
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}
