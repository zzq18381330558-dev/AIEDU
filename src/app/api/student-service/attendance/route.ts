import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeAttendanceInput } from "@/lib/student-service";
import { buildAttendanceScopeWhere, buildCourseSessionScopeWhere, buildStudentScopeWhere } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;

  const items = await prisma.attendanceRecord.findMany({
    where: await buildAttendanceScopeWhere(auth.user),
    include: {
      student: { select: { id: true, name: true, school: true } },
      courseSession: { select: { title: true, startsAt: true, class: { select: { name: true } } } },
      recorder: { select: { name: true, email: true, phone: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 200
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;
  if (auth.user.role === "ADMISSIONS_COUNSELOR") {
    return NextResponse.json({ error: "招生老师无权登记打卡" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const studentId = String(body.studentId || "");
    const courseSessionId = String(body.courseSessionId || "");
    if (!studentId || !courseSessionId) throw new Error("请选择学员和课程");

    const [student, courseSession] = await Promise.all([
      prisma.student.findFirst({
        where: { AND: [{ id: studentId }, await buildStudentScopeWhere(auth.user)] },
        select: { id: true, campusId: true, classId: true }
      }),
      prisma.courseSession.findFirst({
        where: { AND: [{ id: courseSessionId }, await buildCourseSessionScopeWhere(auth.user)] },
        select: { id: true, campusId: true, classId: true }
      })
    ]);
    if (!student) throw new Error("学员不存在或无权登记");
    if (!courseSession) throw new Error("课程不存在或无权登记");
    if (!student.classId) throw new Error("请先为学员分配班级后再登记课程打卡");
    if (student.classId !== courseSession.classId) throw new Error("学员不属于该课程班级");
    if (student.campusId !== courseSession.campusId) throw new Error("学员校区与课程校区不一致");

    const input = normalizeAttendanceInput(body);
    const item = await prisma.attendanceRecord.upsert({
      where: { studentId_courseSessionId: { studentId, courseSessionId } },
      update: {
        ...input,
        recorderId: auth.user.id
      },
      create: {
        studentId,
        courseSessionId,
        ...input,
        recorderId: auth.user.id
      }
    });
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}
