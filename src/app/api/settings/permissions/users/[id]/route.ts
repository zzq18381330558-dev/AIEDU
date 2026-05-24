import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { isPermissionModule, permissionModules } from "@/lib/permission-modules";
import { getEffectivePermissionState, getUserPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function normalizeModules(value: unknown) {
  if (!Array.isArray(value)) throw new Error("请选择权限模块");
  return value.map(String).filter(isPermissionModule);
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "仅管理员可以管理权限" }, { status: 403 });

  try {
    const { id } = await context.params;
    const user = await prisma.user.findFirst({
      where: { id, organizationId: auth.user.organizationId },
      select: { id: true, role: true }
    });
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    const userPermissions = await getUserPermissions(id);
    const effective = await getEffectivePermissionState(user);
    return NextResponse.json({
      modules: effective.modules,
      configured: userPermissions.configured,
      source: effective.source,
      userConfigured: effective.userConfigured,
      roleConfigured: effective.roleConfigured
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "仅管理员可以管理权限" }, { status: 403 });

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
    const effective = await getEffectivePermissionState(user);
    return NextResponse.json({
      modules: effective.modules,
      configured: userPermissions.configured,
      source: effective.source,
      userConfigured: effective.userConfigured,
      roleConfigured: effective.roleConfigured
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "仅管理员可以管理权限" }, { status: 403 });

  try {
    const { id } = await context.params;
    const user = await prisma.user.findFirst({
      where: { id, organizationId: auth.user.organizationId },
      select: { id: true, role: true }
    });
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    await prisma.userPermission.deleteMany({ where: { userId: id } });
    const effective = await getEffectivePermissionState(user);
    return NextResponse.json({
      message: "已清除个人权限，当前用户将恢复使用角色权限",
      modules: effective.modules,
      configured: false,
      source: effective.source,
      userConfigured: false,
      roleConfigured: effective.roleConfigured
    });
  } catch (error) {
    return jsonError(error);
  }
}
