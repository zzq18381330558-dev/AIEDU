import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildCampusScopeWhere, canAccessCampusId, isGlobalDataRole } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";
import { maskIdNumber, normalizeUserInput } from "@/lib/settings";

const safeUserSelect = {
  id: true,
  organizationId: true,
  campusId: true,
  name: true,
  phone: true,
  idNumber: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  campus: { select: { id: true, name: true } }
};

function toSafeUserDto<T extends { idNumber?: string | null }>(user: T) {
  const { idNumber, ...rest } = user;
  return {
    ...rest,
    hasIdNumber: Boolean(idNumber),
    maskedIdNumber: maskIdNumber(idNumber)
  };
}

function deleteResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message, error: message }, { status });
}

async function getUserDeleteBlockReason(userId: string) {
  const [managedCampuses, assistantRows, userPermissions] = await Promise.all([
    prisma.campus.count({ where: { managerId: userId } }),
    prisma.campusAssistant.count({ where: { userId } }),
    prisma.userPermission.count({ where: { userId } })
  ]);

  if (managedCampuses > 0) return "该用户仍担任校区校长";
  if (assistantRows > 0) return "该用户仍担任校长助理";
  if (userPermissions > 0) return "该用户存在个人权限配置，无法删除";

  const [
    createdLeads,
    assignedLeads,
    leadFollowUps,
    academicStudents,
    salesStudents,
    managedClasses,
    taughtClasses,
    courseSessions,
    attendanceRecords,
    studentReminders,
    serviceTickets,
    teachingContents,
    teachingContentReviews,
    sopTaskCheckIns,
    sopInspections,
    sopWeeklyReports
  ] = await Promise.all([
    prisma.lead.count({ where: { creatorId: userId } }),
    prisma.lead.count({ where: { assigneeId: userId } }),
    prisma.leadFollowUp.count({ where: { creatorId: userId } }),
    prisma.student.count({ where: { academicOwnerId: userId } }),
    prisma.student.count({ where: { salesOwnerId: userId } }),
    prisma.studentClass.count({ where: { academicOwnerId: userId } }),
    prisma.studentClass.count({ where: { lecturerId: userId } }),
    prisma.courseSession.count({ where: { lecturerId: userId } }),
    prisma.attendanceRecord.count({ where: { recorderId: userId } }),
    prisma.studentReminder.count({ where: { creatorId: userId } }),
    prisma.serviceTicket.count({ where: { ownerId: userId } }),
    prisma.teachingContent.count({ where: { authorId: userId } }),
    prisma.teachingContentReview.count({ where: { reviewerId: userId } }),
    prisma.sopTaskCheckIn.count({ where: { userId } }),
    prisma.sopInspection.count({ where: { inspectorId: userId } }),
    prisma.sopWeeklyReport.count({ where: { reporterId: userId } })
  ]);

  const businessReferenceCount =
    createdLeads +
    assignedLeads +
    leadFollowUps +
    academicStudents +
    salesStudents +
    managedClasses +
    taughtClasses +
    courseSessions +
    attendanceRecords +
    studentReminders +
    serviceTickets +
    teachingContents +
    teachingContentReviews +
    sopTaskCheckIns +
    sopInspections +
    sopWeeklyReports;

  if (businessReferenceCount > 0) return "该用户存在业务数据，无法删除";
  return null;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  try {
    const exists = await prisma.user.findFirst({
      where: {
        id,
        organizationId: auth.user.organizationId,
        ...(isGlobalDataRole(auth.user.role) ? {} : await buildCampusScopeWhere(auth.user))
      },
      select: { id: true, role: true, campusId: true }
    });
    if (!exists) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    const body = await request.json();
    const normalized = normalizeUserInput(body, { organizationId: auth.user.organizationId });
    if (!isGlobalDataRole(auth.user.role)) {
      if (exists.role === "ADMIN" || normalized.role === "ADMIN") {
        return NextResponse.json({ error: "校区校长不能管理管理员" }, { status: 403 });
      }
      if (!(await canAccessCampusId(auth.user, normalized.campusId, { activeOnly: true }))) {
        return NextResponse.json({ error: "无权限操作该校区数据" }, { status: 403 });
      }
    }
    const data = Object.prototype.hasOwnProperty.call(body, "idNumber")
      ? normalized
      : {
          organizationId: normalized.organizationId,
          campusId: normalized.campusId,
          name: normalized.name,
          phone: normalized.phone,
          role: normalized.role,
          status: normalized.status
        };
    const item = await prisma.user.update({
      where: { id },
      data,
      select: safeUserSelect
    });
    return NextResponse.json({ item: toSafeUserDto(item) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  if (auth.user.role !== "ADMIN") return deleteResponse("仅管理员可删除用户", 403);

  const { id } = await context.params;
  if (id === auth.user.id) return deleteResponse("当前登录账号不可删除", 400);

  try {
    const user = await prisma.user.findFirst({
      where: { id, organizationId: auth.user.organizationId },
      select: { id: true, name: true, phone: true, role: true }
    });
    if (!user) return deleteResponse("用户不存在", 404);
    if (user.role === "ADMIN") return deleteResponse("管理员账号不可删除", 400);
    if (user.name === "周自强" || user.phone === "18381330558") {
      return deleteResponse("周自强账号不可删除", 400);
    }

    const blockReason = await getUserDeleteBlockReason(id);
    if (blockReason) return deleteResponse(blockReason, 400);

    await prisma.$transaction([
      prisma.userPermission.deleteMany({ where: { userId: id } }),
      prisma.campusAssistant.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true, message: "用户已删除" });
  } catch (error) {
    if (error instanceof Error && /Foreign key constraint|P2003/i.test(error.message)) {
      return deleteResponse("该用户存在业务数据，无法删除", 400);
    }
    return deleteResponse("删除用户失败，请稍后重试", 500);
  }
}
