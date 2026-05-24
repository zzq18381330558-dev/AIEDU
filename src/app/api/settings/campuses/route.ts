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

export async function GET() {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;

  const items = await prisma.campus.findMany({
    where: await buildAccessibleCampusWhere(auth.user),
    include,
    orderBy: [{ status: "asc" }, { name: "asc" }]
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  if (!isGlobalDataRole(auth.user.role)) {
    return NextResponse.json({ error: "校区校长不可新建校区" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = normalizeCampusInput(body, { organizationId: auth.user.organizationId });
    const assistantIds = normalizeCampusAssistantIds(body);
    await assertAssistantUsers(auth.user.organizationId, assistantIds);
    const item = await prisma.$transaction(async (tx) => {
      const campus = await tx.campus.create({ data });
      if (assistantIds.length) {
        await tx.campusAssistant.createMany({
          data: assistantIds.map((userId) => ({ campusId: campus.id, userId })),
          skipDuplicates: true
        });
      }
      return tx.campus.findUniqueOrThrow({ where: { id: campus.id }, include });
    });
    return NextResponse.json({ item }, { status: 201 });
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
