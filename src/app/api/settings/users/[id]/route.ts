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
  email: true,
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
          email: normalized.email,
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
