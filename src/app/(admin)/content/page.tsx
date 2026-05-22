import { GraduationCap } from "lucide-react";
import { ContentActions } from "@/components/content/content-actions";
import { ContentTabs } from "@/components/content/content-tabs";
import { teachingContentLabels } from "@/lib/teaching-content";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function ContentPage() {
  const user = await requireUser("/content");
  const [items, campuses, draftCount, reviewingCount, publishedCount] = await Promise.all([
    prisma.teachingContent.findMany({
      include: {
        author: { select: { name: true } },
        _count: { select: { versions: true, reviews: true, publications: true, exports: true } }
      },
      orderBy: { updatedAt: "desc" },
      take: 100
    }),
    prisma.campus.findMany({
      where: user.role === "ADMIN" || user.role === "HQ_OPERATIONS" ? { organizationId: user.organizationId } : user.campusId ? { id: user.campusId } : { id: "__none__" },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.teachingContent.count({ where: { status: "DRAFT" } }),
    prisma.teachingContent.count({ where: { status: "REVIEWING" } }),
    prisma.teachingContent.count({ where: { status: "PUBLISHED" } })
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white shadow-soft">
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-ink">教研中心</h1>
              <p className="mt-2 text-sm text-muted">统一管理讲义、PPT、真题解析、模板、短视频和招生内容，支持审核、版本、发布与导出。</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <Metric label="草稿" value={String(draftCount)} />
            <Metric label="待审核" value={String(reviewingCount)} />
            <Metric label="已发布" value={String(publishedCount)} />
          </div>
        </div>
        <ContentTabs />
      </section>

      <section className="overflow-hidden rounded-lg border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left text-sm">
            <thead className="bg-[#F8FAFB] text-muted">
              <tr>
                <Th>内容</Th>
                <Th>类型</Th>
                <Th>分类</Th>
                <Th>状态</Th>
                <Th>版本</Th>
                <Th>作者</Th>
                <Th>校区发布</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => (
                <tr key={item.id} className="align-top hover:bg-[#FAFBFC]">
                  <Td className="max-w-md whitespace-normal">
                    <div className="font-semibold text-ink">{item.title}</div>
                    <div className="mt-1 text-xs text-muted">{item.summary || item.body?.slice(0, 80) || "暂无摘要"}</div>
                    <a href={`/content/${item.id}/versions`} className="mt-2 inline-block text-xs text-brand-700">查看版本记录</a>
                  </Td>
                  <Td>{teachingContentLabels.type[item.type]}</Td>
                  <Td>{item.category}</Td>
                  <Td>{teachingContentLabels.status[item.status]}</Td>
                  <Td>v{item.currentVersion}<div className="text-xs text-muted">{item._count.versions} 条</div></Td>
                  <Td>{item.author.name}</Td>
                  <Td>{item._count.publications}</Td>
                  <Td><ContentActions id={item.id} campuses={campuses} /></Td>
                </tr>
              ))}
              {items.length === 0 ? <tr><td colSpan={8} className="px-4 py-12 text-center text-muted">暂无内容</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-line px-4 py-2"><div className="text-xs text-muted">{label}</div><div className="text-lg font-semibold text-ink">{value}</div></div>;
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-4 py-3 text-ink ${className}`}>{children}</td>;
}
