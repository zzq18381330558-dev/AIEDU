import "server-only";

import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isPermissionModule, permissionModules, type PermissionModule } from "@/lib/permission-modules";
import { modulePermissions, roleHome } from "@/lib/roles";

export type PermissionUser = { id: string; role: UserRole };

export function moduleFromPath(pathname: string) {
  const normalized = pathname.startsWith("/api/") ? pathname.slice(4) : pathname;
  const item = permissionModules
    .slice()
    .sort((a, b) => b.path.length - a.path.length)
    .find((module) => normalized === module.path || normalized.startsWith(`${module.path}/`));
  return item?.key || null;
}

function legacyRoleModules(role: UserRole) {
  return permissionModules
    .filter((item) => modulePermissions[item.path]?.includes(role))
    .map((item) => item.key);
}

function allModules() {
  return permissionModules.map((item) => item.key);
}

function enabledModules(rows: Array<{ module: string; enabled: boolean }>) {
  return rows.filter((item) => item.enabled && isPermissionModule(item.module)).map((item) => item.module as PermissionModule);
}

export async function getRolePermissions(role: UserRole) {
  const rows = await prisma.rolePermission.findMany({ where: { role }, orderBy: { module: "asc" } });
  if (rows.length) return enabledModules(rows);
  if (role === "ADMIN") return allModules();
  return legacyRoleModules(role);
}

export async function getUserPermissions(userId: string) {
  const rows = await prisma.userPermission.findMany({ where: { userId }, orderBy: { module: "asc" } });
  return {
    configured: rows.length > 0,
    modules: enabledModules(rows)
  };
}

export async function getEffectivePermissions(user: PermissionUser) {
  const userPermissions = await getUserPermissions(user.id);
  if (userPermissions.configured) return userPermissions.modules;
  return getRolePermissions(user.role);
}

export async function canAccessModule(user: PermissionUser, permissionModule: PermissionModule) {
  const modules = await getEffectivePermissions(user);
  return modules.includes(permissionModule);
}

export async function canAccessPath(user: PermissionUser, pathname: string) {
  const permissionModule = moduleFromPath(pathname);
  if (!permissionModule) return true;
  return canAccessModule(user, permissionModule);
}

export async function getFirstAllowedPath(user: PermissionUser) {
  const modules = await getEffectivePermissions(user);
  const firstModule = permissionModules.find((item) => modules.includes(item.key));
  if (firstModule) return firstModule.path;
  return roleHome[user.role] || "/login";
}
