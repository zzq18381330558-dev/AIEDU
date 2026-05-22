import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeStudentInput, studentScopeWhere } from "@/lib/student-service";
import { prisma } from "@/lib/prisma";

const include = {
  campus: { select: { id: true, name: true } },
  class: { select: { id: true, name: true } },
  academicOwner: { select: { id: true, name: true } },
  salesOwner: { select: { id: true, name: true } },
  _count: { select: { attendanceRecords: true, studyPlans: true, reminders: true } }
} satisfies Prisma.StudentInclude;

export async function GET(request: NextRequest) {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const where: Prisma.StudentWhereInput = { ...studentScopeWhere(auth.user) };
  const search = searchParams.get("search")?.trim();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { school: { contains: search, mode: "insensitive" } },
      { major: { contains: search, mode: "insensitive" } }
    ];
  }
  const classId = searchParams.get("classId");
  const studyStatus = searchParams.get("studyStatus");
  if (classId) where.classId = classId;
  if (studyStatus) where.studyStatus = studyStatus as Prisma.EnumStudentStudyStatusFilter["equals"];

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
    if (data.classId) {
      const studentClass = await prisma.studentClass.findFirst({
        where: { id: data.classId, campusId: data.campusId },
        select: { id: true }
      });
      if (!studentClass) throw new Error("所选班级不属于该学员校区");
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
