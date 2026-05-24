import { SettingsDashboard } from "@/components/settings/settings-dashboard";
import { buildAccessibleCampusWhere, buildCampusScopeWhere, isGlobalDataRole } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { maskIdNumber } from "@/lib/settings";
import { listBusinessDictionaries, listBusinessDictionaryCategories } from "@/lib/settings-dictionary-db";

function toSafeUserDto<T extends { idNumber?: string | null }>(item: T) {
  const { idNumber, ...rest } = item;
  return {
    ...rest,
    hasIdNumber: Boolean(idNumber),
    maskedIdNumber: maskIdNumber(idNumber)
  };
}

export default async function SettingsPage() {
  const user = await requireUser("/settings");
  const campusWhere = await buildAccessibleCampusWhere(user);
  const userCampusScope = await buildCampusScopeWhere(user);
  const isAdmin = isGlobalDataRole(user.role);

  const [users, campuses, dictionaries, dictionaryCategories, managers, assistantUsers] = await Promise.all([
    prisma.user.findMany({
      where: isAdmin
        ? { organizationId: user.organizationId }
        : { organizationId: user.organizationId, ...userCampusScope },
      select: {
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
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }]
    }),
    prisma.campus.findMany({
      where: campusWhere,
      include: {
        manager: { select: { id: true, name: true, phone: true } },
        assistants: { include: { user: { select: { id: true, name: true, phone: true, role: true } } }, orderBy: { createdAt: "asc" } },
        _count: { select: { users: true, leads: true, students: true } }
      },
      orderBy: [{ status: "asc" }, { name: "asc" }]
    }),
    isAdmin ? listBusinessDictionaries(user.organizationId) : Promise.resolve([]),
    isAdmin ? listBusinessDictionaryCategories() : Promise.resolve([]),
    prisma.user.findMany({
      where: isAdmin
        ? {
            organizationId: user.organizationId,
            role: { in: ["ADMIN", "CAMPUS_MANAGER"] },
            status: "ACTIVE"
          }
        : { id: user.id },
      select: { id: true, name: true, phone: true },
      orderBy: { name: "asc" }
    }),
    isAdmin
      ? prisma.user.findMany({
          where: {
            organizationId: user.organizationId,
            status: "ACTIVE",
            role: { not: "ADMIN" }
          },
          select: { id: true, name: true, phone: true, role: true },
          orderBy: { name: "asc" }
        })
      : Promise.resolve([])
  ]);

  return (
    <SettingsDashboard
      initialUsers={JSON.parse(JSON.stringify(users.map(toSafeUserDto)))}
      initialCampuses={JSON.parse(JSON.stringify(campuses))}
      initialDictionaries={JSON.parse(JSON.stringify(dictionaries))}
      initialDictionaryCategories={JSON.parse(JSON.stringify(dictionaryCategories))}
      managers={managers}
      assistantUsers={assistantUsers}
      currentUserRole={user.role}
    />
  );
}
