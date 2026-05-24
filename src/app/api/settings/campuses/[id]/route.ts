import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildAccessibleCampusWhere, isGlobalDataRole } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";
import { normalizeCampusAssistantIds, normalizeCampusInput } from "@/lib/settings";

const include = {
  manager: { select: { id: true, name: true, phone: true } },
  assistants: { include: { user: { select: { id: true, name: true, phone: true, role: true } } }, orderBy: { createdAt: "asc" as const } },
  _count: { select: { users: true, leads: true, students: true } }
};

function deleteResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message, error: message }, { status });
}

async function getCampusDeleteBlockReason(campusId: string) {
  const [users, assistants, contentPublications] = await Promise.all([
    prisma.user.count({ where: { campusId } }),
    prisma.campusAssistant.count({ where: { campusId } }),
    prisma.teachingContentPublication.count({ where: { campusId } })
  ]);

  if (users > 0) return "该校区存在用户，无法删除";
  if (assistants > 0) return "该校区存在校长助理，无法删除";
  if (contentPublications > 0) return "该校区存在教研发布记录，无法删除";

  const [
    leads,
    students,
    classes,
    courseSessions,
    attendanceRecords,
    studentReminders,
    sopExecutions,
    sopTasks,
    sopWeeklyReports
  ] = await Promise.all([
    prisma.lead.count({ where: { campusId } }),
    prisma.student.count({ where: { campusId } }),
    prisma.studentClass.count({ where: { campusId } }),
    prisma.courseSession.count({ where: { campusId } }),
    prisma.attendanceRecord.count({
      where: { OR: [{ student: { campusId } }, { courseSession: { campusId } }] }
    }),
    prisma.studentReminder.count({
      where: {
        OR: [
          { student: { campusId } },
          { class: { campusId } },
          { courseSession: { campusId } }
        ]
      }
    }),
    prisma.sopExecution.count({ where: { campusId } }),
    prisma.sopTask.count({ where: { campusId } }),
    prisma.sopWeeklyReport.count({ where: { campusId } })
  ]);

  const businessReferenceCount =
    leads +
    students +
    classes +
    courseSessions +
    attendanceRecords +
    studentReminders +
    sopExecutions +
    sopTasks +
    sopWeeklyReports;

  if (businessReferenceCount > 0) return "该校区存在业务数据，无法删除";
  return null;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  try {
    const exists = await prisma.campus.findFirst({
      where: { AND: [{ id, organizationId: auth.user.organizationId }, await buildAccessibleCampusWhere(auth.user)] },
      select: { id: true, managerId: true, status: true }
    });
    if (!exists) return NextResponse.json({ error: "校区不存在" }, { status: 404 });

    const body = await request.json();
    const data = normalizeCampusInput(body, { organizationId: auth.user.organizationId });
    if (!isGlobalDataRole(auth.user.role)) {
      if (data.managerId !== exists.managerId) {
        return NextResponse.json({ error: "校区校长不可修改校长" }, { status: 403 });
      }
      if (data.status !== exists.status) {
        return NextResponse.json({ error: "校区校长不可停用或启用校区" }, { status: 403 });
      }
    }
    const hasAssistantIds = Object.prototype.hasOwnProperty.call(body, "assistantIds");
    const assistantIds = normalizeCampusAssistantIds(body);
    if (hasAssistantIds && !isGlobalDataRole(auth.user.role)) {
      return NextResponse.json({ error: "仅管理员可以配置校长助理" }, { status: 403 });
    }
    if (hasAssistantIds) await assertAssistantUsers(auth.user.organizationId, assistantIds);

    const item = await prisma.$transaction(async (tx) => {
      await tx.campus.update({ where: { id }, data });
      if (hasAssistantIds) {
        await tx.campusAssistant.deleteMany({ where: { campusId: id } });
        if (assistantIds.length) {
          await tx.campusAssistant.createMany({
            data: assistantIds.map((userId) => ({ campusId: id, userId })),
            skipDuplicates: true
          });
        }
      }
      return tx.campus.findUniqueOrThrow({ where: { id }, include });
    });
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  if (!isGlobalDataRole(auth.user.role)) return deleteResponse("仅管理员可删除校区", 403);

  const { id } = await context.params;

  try {
    const campus = await prisma.campus.findFirst({
      where: { id, organizationId: auth.user.organizationId },
      select: { id: true, name: true }
    });
    if (!campus) return deleteResponse("校区不存在", 404);
    if (campus.name === "总部校区") return deleteResponse("总部校区不可删除", 400);

    const blockReason = await getCampusDeleteBlockReason(id);
    if (blockReason) return deleteResponse(blockReason, 400);

    await prisma.$transaction([
      prisma.campusAssistant.deleteMany({ where: { campusId: id } }),
      prisma.campus.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true, message: "校区已删除" });
  } catch (error) {
    if (error instanceof Error && /Foreign key constraint|P2003/i.test(error.message)) {
      return deleteResponse("该校区存在业务数据，无法删除", 400);
    }
    return deleteResponse("删除校区失败，请稍后重试", 500);
  }
}

async function assertAssistantUsers(organizationId: string, assistantIds: string[]) {
  if (!assistantIds.length) return;
  const users = await prisma.user.findMany({
    where: { id: { in: assistantIds }, organizationId, status: "ACTIVE", role: { not: "ADMIN" } },
    select: { id: true }
  });
  if (users.length !== assistantIds.length) {
    throw new Error("校长助理必须为启用状态且不能是管理员");
  }
}
