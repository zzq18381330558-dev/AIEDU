import { CrmDashboard } from "@/components/crm/crm-dashboard";
import { getTodayRange, leadScopeWhere } from "@/lib/crm";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function CrmPage() {
  const user = await requireUser("/crm");
  const scope = leadScopeWhere(user);
  const today = getTodayRange();

  const campusWhere =
    user.role === "ADMIN" || user.role === "HQ_OPERATIONS"
      ? { organizationId: user.organizationId, status: "ACTIVE" as const }
      : user.campusId
        ? { id: user.campusId, status: "ACTIVE" as const }
        : { id: "__none__" };

  const [leads, campuses, counselors, statusGroups, sourceGroups, todayCount] = await Promise.all([
    prisma.lead.findMany({
      where: scope,
      include: {
        campus: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, phone: true } },
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
      where: {
        role: "ADMISSIONS_COUNSELOR",
        status: "ACTIVE",
        ...(user.role === "CAMPUS_MANAGER" && user.campusId ? { campusId: user.campusId } : {})
      },
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
