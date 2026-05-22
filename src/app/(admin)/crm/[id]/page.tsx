import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LeadConvertButton } from "@/components/crm/lead-convert-button";
import { FollowUpPanel } from "@/components/crm/follow-up-panel";
import { crmLabels, leadScopeWhere } from "@/lib/crm";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("/crm");
  const { id } = await params;

  const lead = await prisma.lead.findFirst({
    where: { id, ...leadScopeWhere(user) },
    include: {
      campus: { select: { name: true } },
      assignee: { select: { name: true } },
      student: { select: { id: true } },
      followUps: {
        include: { creator: { select: { name: true } } },
        orderBy: { followAt: "desc" }
      }
    }
  });

  if (!lead) notFound();

  return (
    <div className="space-y-6">
      <Link href="/crm" className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" />
        返回 CRM
      </Link>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{lead.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Badge>{crmLabels.status[lead.status]}</Badge>
              <Badge>意向 {crmLabels.intentLevel[lead.intentLevel]}</Badge>
              <Badge>{crmLabels.examTrack[lead.examTrack]}</Badge>
              <Badge>{crmLabels.sourceChannel[lead.sourceChannel]}</Badge>
              {lead.student ? <Badge>已转学员</Badge> : null}
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-2 text-sm text-muted sm:grid-cols-2 lg:text-right">
              <div>手机：{lead.phone}</div>
              <div>微信：{lead.wechat || "-"}</div>
              <div>校区：{lead.campus.name}</div>
              <div>招生老师：{lead.assignee?.name || "未分配"}</div>
              <div>学校：{lead.school || "-"}</div>
              <div>专业：{lead.grade || ""} {lead.major || ""}</div>
              <div>最近跟进：{lead.lastFollowedAt ? lead.lastFollowedAt.toLocaleString("zh-CN") : "-"}</div>
              <div>下次跟进：{lead.nextFollowUpAt ? lead.nextFollowUpAt.toLocaleString("zh-CN") : "-"}</div>
            </div>
            <div className="flex justify-start lg:justify-end">
              {lead.student ? (
                <Link href={`/student-service/${lead.student.id}`} className="inline-flex h-10 items-center rounded-md border border-line px-3 text-sm text-ink">
                  查看学员档案
                </Link>
              ) : (
                <LeadConvertButton leadId={lead.id} converted={false} />
              )}
            </div>
          </div>
        </div>
        {lead.note ? <p className="mt-4 rounded-md bg-[#F8FAFB] p-3 text-sm leading-6 text-muted">{lead.note}</p> : null}
      </section>

      <FollowUpPanel
        leadId={lead.id}
        initialItems={JSON.parse(JSON.stringify(lead.followUps))}
        defaultStatus={lead.status}
        defaultIntentLevel={lead.intentLevel}
        defaultNextAt={lead.nextFollowUpAt?.toISOString() || null}
      />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md bg-brand-50 px-2 py-1 text-brand-700">{children}</span>;
}
