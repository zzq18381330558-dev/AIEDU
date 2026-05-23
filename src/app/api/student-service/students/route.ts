import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeStudentInput } from "@/lib/student-service";
import { buildAccessibleCampusWhere, buildClassScopeWhere, buildScopedUserWhere, buildStudentScopeWhere } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

const include = {
  campus: { select: { id: true, name: true } },
  class: { select: { id: true, name: true } },
  academicOwner: { select: { id: true, name: true, email: true, phone: true } },
  salesOwner: { select: { id: true, name: true, email: true, phone: true } },
  _count: { select: { attendanceRecords: true, studyPlans: true, reminders: true } }
} satisfies Prisma.StudentInclude;

export async function GET(request: NextRequest) {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const scope = await buildStudentScopeWhere(auth.user);
  const filters: Prisma.StudentWhereInput = {};
  const search = searchParams.get("search")?.trim();
  if (search) {
    filters.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { school: { contains: search, mode: "insensitive" } },
      { major: { contains: search, mode: "insensitive" } }
    ];
  }
  const classId = searchParams.get("classId");
  const studyStatus = searchParams.get("studyStatus");
  if (classId) filters.classId = classId;
  if (studyStatus) filters.studyStatus = studyStatus as Prisma.EnumStudentStudyStatusFilter["equals"];
  const where: Prisma.StudentWhereInput = { AND: [scope, filters] };

  const items = await prisma.student.findMany({
    where,
    include,
    orderBy: { updatedAt: "desc" },
    take: 100
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;
  if (auth.user.role === "ADMISSIONS_COUNSELOR") {
    return NextResponse.json({ error: "招生老师仅可查看自己成交学员" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = normalizeStudentInput(body, { campusId: auth.user.campusId || String(body.campusId || "") });
    const campus = await prisma.campus.findFirst({
      where: { AND: [{ id: data.campusId }, await buildAccessibleCampusWhere(auth.user, { activeOnly: true })] },
      select: { id: true }
    });
    if (!campus) return NextResponse.json({ error: "校区不存在或无权限" }, { status: 404 });
    if (data.classId) {
      const studentClass = await prisma.studentClass.findFirst({
        where: { AND: [{ id: data.classId, campusId: data.campusId }, await buildClassScopeWhere(auth.user)] },
        select: { id: true }
      });
      if (!studentClass) throw new Error("所选班级不属于该学员校区");
    }
    if (data.academicOwnerId) {
      const academicOwner = await prisma.user.findFirst({
        where: { AND: [{ id: data.academicOwnerId }, await buildScopedUserWhere(auth.user, "ACADEMIC_TEACHER")] },
        select: { id: true, campusId: true }
      });
      if (!academicOwner) throw new Error("教务老师不存在或无权限");
      if (academicOwner.campusId && academicOwner.campusId !== data.campusId) throw new Error("教务老师不属于所选校区");
    }
    if (data.salesOwnerId) {
      const salesOwner = await prisma.user.findFirst({
        where: { AND: [{ id: data.salesOwnerId }, await buildScopedUserWhere(auth.user, "ADMISSIONS_COUNSELOR")] },
        select: { id: true, campusId: true }
      });
      if (!salesOwner) throw new Error("招生老师不存在或无权限");
      if (salesOwner.campusId && salesOwner.campusId !== data.campusId) throw new Error("招生老师不属于所选校区");
    }
    const item = await prisma.student.create({
      data,
      include
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
