import { SettingsDashboard } from "@/components/settings/settings-dashboard";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { listBusinessDictionaries } from "@/lib/settings-dictionary-db";

export default async function SettingsPage() {
  const user = await requireUser("/settings");

  const [users, campuses, dictionaries, managers] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: user.organizationId },
      include: { campus: { select: { id: true, name: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }]
    }),
    prisma.campus.findMany({
      where: { organizationId: user.organizationId },
      include: {
        manager: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { users: true, leads: true, students: true } }
      },
      orderBy: [{ status: "asc" }, { name: "asc" }]
    }),
    listBusinessDictionaries(user.organizationId),
    prisma.user.findMany({
      where: {
        organizationId: user.organizationId,
        role: { in: ["ADMIN", "CAMPUS_MANAGER"] },
        status: "ACTIVE"
      },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <SettingsDashboard
      initialUsers={JSON.parse(JSON.stringify(users))}
      initialCampuses={JSON.parse(JSON.stringify(campuses))}
      initialDictionaries={JSON.parse(JSON.stringify(dictionaries))}
      managers={managers}
    />
  );
}
