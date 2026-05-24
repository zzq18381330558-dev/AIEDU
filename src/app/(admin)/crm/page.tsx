import { CrmDashboard } from "@/components/crm/crm-dashboard";
import { getTodayRange } from "@/lib/crm";
import { buildAccessibleCampusWhere, buildCrmLeadScopeWhere, buildScopedUserWhere } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function CrmPage() {
  const user = await requireUser("/crm");
  const scope = await buildCrmLeadScopeWhere(user);
  const today = getTodayRange();
  const campusWhere = await buildAccessibleCampusWhere(user, { activeOnly: true });

  const [leads, campuses, counselors, statusGroups, sourceGroups, todayCount] = await Promise.all([
    prisma.lead.findMany({
      where: scope,
      include: {
        campus: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, phone: true } },
        _count: { select: { followUps: true } }
      },
      orderBy: [{ nextFollowUpAt: "asc" }, { updatedAt: "desc" }],
      take: 100
    }),
    prisma.campus.findMany({
      where: campusWhere,
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.user.findMany({
      where: await buildScopedUserWhere(user, "ADMISSIONS_COUNSELOR"),
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: scope,
      _count: { _all: true }
    }),
    prisma.lead.groupBy({
      by: ["sourceChannel"],
      where: scope,
      _count: { _all: true }
    }),
    prisma.lead.count({
      where: {
        ...scope,
        nextFollowUpAt: { gte: today.start, lt: today.end }
      }
    })
  ]);

  return (
    <CrmDashboard
      initialLeads={JSON.parse(JSON.stringify(leads))}
      campuses={campuses}
      counselors={counselors}
      statusGroups={statusGroups}
      sourceGroups={sourceGroups}
      todayCount={todayCount}
    />
  );
}
