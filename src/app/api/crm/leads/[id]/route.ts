import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { normalizeLeadUpdateInput } from "@/lib/crm";
import { buildAccessibleCampusWhere, buildCrmLeadScopeWhere, buildScopedUserWhere, canAccessCampusId } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

const include = {
  campus: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true, email: true, phone: true } },
  creator: { select: { id: true, name: true, email: true, phone: true } },
  _count: { select: { followUps: true } }
};

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/crm");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  const scope = await buildCrmLeadScopeWhere(auth.user);
  const lead = await prisma.lead.findFirst({
    where: { AND: [{ id }, scope] },
    include
  });

  if (!lead) return NextResponse.json({ error: "线索不存在" }, { status: 404 });
  return NextResponse.json({ item: lead });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/crm");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  try {
    const scope = await buildCrmLeadScopeWhere(auth.user);
    const exists = await prisma.lead.findFirst({
      where: { AND: [{ id }, scope] },
      select: { id: true }
    });
    if (!exists) return NextResponse.json({ error: "线索不存在" }, { status: 404 });

    const body = await request.json();
    const data = normalizeLeadUpdateInput(body);
    if (typeof data.campusId === "string") {
      if (!(await canAccessCampusId(auth.user, data.campusId, { activeOnly: true }))) {
        return NextResponse.json({ error: "无权限操作该校区数据" }, { status: 403 });
      }
      const campus = await prisma.campus.findFirst({
        where: { AND: [{ id: data.campusId }, await buildAccessibleCampusWhere(auth.user, { activeOnly: true })] },
        select: { id: true }
      });
      if (!campus) return NextResponse.json({ error: "校区不存在或无权限" }, { status: 404 });
    }
    if (typeof data.assigneeId === "string" && data.assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: { AND: [{ id: data.assigneeId }, await buildScopedUserWhere(auth.user, "ADMISSIONS_COUNSELOR")] },
        select: { id: true }
      });
      if (!assignee) return NextResponse.json({ error: "招生老师不存在或无权限" }, { status: 404 });
    }
    const lead = await prisma.lead.update({
      where: { id },
      data,
      include
    });
    return NextResponse.json({ item: lead });
  } catch (error) {
    return jsonError(error);
  }
}
