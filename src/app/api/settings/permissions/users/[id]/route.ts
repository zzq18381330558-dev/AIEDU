import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { isPermissionModule, permissionModules } from "@/lib/permission-modules";
import { getEffectivePermissions, getUserPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function normalizeModules(value: unknown) {
  if (!Array.isArray(value)) throw new Error("请选择权限模块");
  return value.map(String).filter(isPermissionModule);
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;

  try {
    const { id } = await context.params;
    const user = await prisma.user.findFirst({
      where: { id, organizationId: auth.user.organizationId },
      select: { id: true, role: true }
    });
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    const userPermissions = await getUserPermissions(id);
    return NextResponse.json({
      modules: userPermissions.configured ? userPermissions.modules : await getEffectivePermissions(user),
      configured: userPermissions.configured
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;

  try {
    const { id } = await context.params;
    const user = await prisma.user.findFirst({
      where: { id, organizationId: auth.user.organizationId },
      select: { id: true, role: true }
    });
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    const body = await request.json();
    const modules = new Set(normalizeModules(body.modules));

    await prisma.$transaction(
      permissionModules.map((item) =>
        prisma.userPermission.upsert({
          where: { userId_module: { userId: id, module: item.key } },
          update: { enabled: modules.has(item.key) },
          create: { userId: id, module: item.key, enabled: modules.has(item.key) }
        })
      )
    );

    const userPermissions = await getUserPermissions(id);
    return NextResponse.json({ modules: userPermissions.modules, configured: true });
  } catch (error) {
    return jsonError(error);
  }
}
