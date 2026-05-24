import "server-only";

import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolvePermissionSource } from "@/lib/permission-resolution";
import { isPermissionModule, permissionModules, type PermissionModule } from "@/lib/permission-modules";
import { modulePermissions, roleHome } from "@/lib/roles";

export type PermissionUser = { id: string; role: UserRole };
export type PermissionSource = "admin" | "user" | "role" | "default";

type PermissionRow = { module: string; enabled: boolean; updatedAt: Date };

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

function latestUpdatedAt(rows: PermissionRow[]) {
  if (!rows.length) return null;
  return rows.reduce<Date | null>((latest, row) => {
    if (!latest || row.updatedAt > latest) return row.updatedAt;
    return latest;
  }, null);
}

export async function getRolePermissions(role: UserRole) {
  if (role === "ADMIN") return allModules();
  const rows = await prisma.rolePermission.findMany({ where: { role }, orderBy: { module: "asc" } });
  if (rows.length) return enabledModules(rows);
  return legacyRoleModules(role);
}

export async function getUserPermissions(userId: string) {
  const rows = await prisma.userPermission.findMany({ where: { userId }, orderBy: { module: "asc" } });
  return {
    configured: rows.length > 0,
    modules: enabledModules(rows),
    latestUpdatedAt: latestUpdatedAt(rows)
  };
}

export async function getEffectivePermissionState(user: PermissionUser) {
  if (user.role === "ADMIN") {
    return {
      modules: allModules(),
      source: "admin" as PermissionSource,
      userConfigured: false,
      roleConfigured: true
    };
  }

  const [userRows, roleRows] = await Promise.all([
    prisma.userPermission.findMany({ where: { userId: user.id }, orderBy: { module: "asc" } }),
    prisma.rolePermission.findMany({ where: { role: user.role }, orderBy: { module: "asc" } })
  ]);
  const userLatestUpdatedAt = latestUpdatedAt(userRows);
  const roleLatestUpdatedAt = latestUpdatedAt(roleRows);
  const source = resolvePermissionSource({
    userConfigured: userRows.length > 0,
    roleConfigured: roleRows.length > 0,
    userLatestUpdatedAt,
    roleLatestUpdatedAt
  });

  if (source === "user") {
    return {
      modules: enabledModules(userRows),
      source: "user" as PermissionSource,
      userConfigured: true,
      roleConfigured: roleRows.length > 0,
      userLatestUpdatedAt,
      roleLatestUpdatedAt
    };
  }

  if (source === "role") {
    return {
      modules: enabledModules(roleRows),
      source: "role" as PermissionSource,
      userConfigured: userRows.length > 0,
      roleConfigured: true,
      userLatestUpdatedAt,
      roleLatestUpdatedAt
    };
  }

  return {
    modules: legacyRoleModules(user.role),
    source: "default" as PermissionSource,
    userConfigured: userRows.length > 0,
    roleConfigured: false,
    userLatestUpdatedAt,
    roleLatestUpdatedAt
  };
}

export async function getEffectivePermissions(user: PermissionUser) {
  return (await getEffectivePermissionState(user)).modules;
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
