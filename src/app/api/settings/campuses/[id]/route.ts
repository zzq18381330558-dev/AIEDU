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
