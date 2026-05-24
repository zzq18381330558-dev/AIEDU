import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeStudentInput, normalizeStudentStatusInput } from "@/lib/student-service";
import { buildAccessibleCampusWhere, buildClassScopeWhere, buildScopedUserWhere, buildStudentScopeWhere, canAccessCampusId } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  const item = await prisma.student.findFirst({
    where: { AND: [{ id }, await buildStudentScopeWhere(auth.user)] },
    include: {
      campus: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
      academicOwner: { select: { id: true, name: true, phone: true } },
      salesOwner: { select: { id: true, name: true, phone: true } },
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
      where: { AND: [{ id }, await buildStudentScopeWhere(auth.user)] },
      select: { id: true, campusId: true }
    });
    if (!exists) return NextResponse.json({ error: "学员不存在" }, { status: 404 });

    const body = await request.json();
    const isProfileUpdate = Object.prototype.hasOwnProperty.call(body, "name") || Object.prototype.hasOwnProperty.call(body, "phone");
    let data;
    if (isProfileUpdate) {
      const profileData = normalizeStudentInput(body, { campusId: exists.campusId });
      if (!(await canAccessCampusId(auth.user, profileData.campusId, { activeOnly: true }))) {
        return NextResponse.json({ error: "无权限操作该校区数据" }, { status: 403 });
      }
      const campus = await prisma.campus.findFirst({
        where: { AND: [{ id: profileData.campusId }, await buildAccessibleCampusWhere(auth.user, { activeOnly: true })] },
        select: { id: true }
      });
      if (!campus) return NextResponse.json({ error: "校区不存在或无权限" }, { status: 404 });
      if (profileData.classId) {
        const studentClass = await prisma.studentClass.findFirst({
          where: { AND: [{ id: profileData.classId, campusId: profileData.campusId }, await buildClassScopeWhere(auth.user)] },
          select: { id: true }
        });
        if (!studentClass) throw new Error("所选班级不属于该学员校区");
      }
      if (profileData.academicOwnerId) {
        const academicOwner = await prisma.user.findFirst({
          where: { AND: [{ id: profileData.academicOwnerId }, await buildScopedUserWhere(auth.user, "ACADEMIC_TEACHER")] },
          select: { id: true, campusId: true }
        });
        if (!academicOwner) throw new Error("教务老师不存在或无权限");
        if (academicOwner.campusId && academicOwner.campusId !== profileData.campusId) throw new Error("教务老师不属于所选校区");
      }
      if (profileData.salesOwnerId) {
        const salesOwner = await prisma.user.findFirst({
          where: { AND: [{ id: profileData.salesOwnerId }, await buildScopedUserWhere(auth.user, "ADMISSIONS_COUNSELOR")] },
          select: { id: true, campusId: true }
        });
        if (!salesOwner) throw new Error("招生老师不存在或无权限");
        if (salesOwner.campusId && salesOwner.campusId !== profileData.campusId) throw new Error("招生老师不属于所选校区");
      }
      data = profileData;
    } else {
      data = normalizeStudentStatusInput(body);
    }
    const item = await prisma.student.update({
      where: { id },
      data,
      include: {
        campus: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        academicOwner: { select: { id: true, name: true, phone: true } },
        salesOwner: { select: { id: true, name: true, phone: true } }
      }
    });
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}
