import type { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { isPermissionModule, permissionModules } from "@/lib/permission-modules";
import { getRolePermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { settingsRoleOptions } from "@/lib/settings";

const roleValues = new Set<UserRole>([...settingsRoleOptions.map((item) => item.value), "HQ_OPERATIONS"]);

function normalizeRole(value: string) {
  if (!roleValues.has(value as UserRole)) throw new Error("角色不存在");
  return value as UserRole;
}

function normalizeModules(value: unknown) {
  if (!Array.isArray(value)) throw new Error("请选择权限模块");
  return value.map(String).filter(isPermissionModule);
}

export async function GET(_request: NextRequest, context: { params: Promise<{ role: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;

  try {
    const { role } = await context.params;
    const normalizedRole = normalizeRole(role);
    const modules = await getRolePermissions(normalizedRole);
    const configured = await prisma.rolePermission.count({ where: { role: normalizedRole } });
    return NextResponse.json({ modules, configured: configured > 0 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ role: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;

  try {
    const { role } = await context.params;
    const normalizedRole = normalizeRole(role);
    const body = await request.json();
    const modules = new Set(normalizeModules(body.modules));

    await prisma.$transaction(
      permissionModules.map((item) =>
        prisma.rolePermission.upsert({
          where: { role_module: { role: normalizedRole, module: item.key } },
          update: { enabled: modules.has(item.key) },
          create: { role: normalizedRole, module: item.key, enabled: modules.has(item.key) }
        })
      )
    );

    return NextResponse.json({ modules: await getRolePermissions(normalizedRole), configured: true });
  } catch (error) {
    return jsonError(error);
  }
}
