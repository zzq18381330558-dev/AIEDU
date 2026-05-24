import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildCampusScopeWhere, canAccessCampusId, isGlobalDataRole } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";
import { getInitialUserPassword, maskIdNumber, normalizeUserInput } from "@/lib/settings";

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

export async function GET() {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  const scope = await buildCampusScopeWhere(auth.user);

  const items = await prisma.user.findMany({
    where: isGlobalDataRole(auth.user.role)
      ? { organizationId: auth.user.organizationId }
      : { organizationId: auth.user.organizationId, ...scope },
    select: safeUserSelect,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ items: items.map(toSafeUserDto) });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const userInput = normalizeUserInput(body, { organizationId: auth.user.organizationId });
    if (!isGlobalDataRole(auth.user.role)) {
      if (userInput.role === "ADMIN") return NextResponse.json({ error: "校区校长不能创建管理员" }, { status: 403 });
      if (!(await canAccessCampusId(auth.user, userInput.campusId, { activeOnly: true }))) {
        return NextResponse.json({ error: "无权限操作该校区数据" }, { status: 403 });
      }
    }
    const password = typeof body.password === "string" && body.password.trim()
      ? body.password.trim()
      : getInitialUserPassword(userInput);
    const item = await prisma.user.create({
      data: {
        ...userInput,
        passwordHash: await bcrypt.hash(password, 10)
      },
      select: safeUserSelect
    });
    return NextResponse.json({ item: toSafeUserDto(item) }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
