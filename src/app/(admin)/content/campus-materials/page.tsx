import { ContentTabs } from "@/components/content/content-tabs";
import { buildCampusMaterialScopeWhere } from "@/lib/data-scope";
import { teachingContentLabels } from "@/lib/teaching-content";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function CampusMaterialsPage() {
  const user = await requireUser("/content/campus-materials");
  const where = await buildCampusMaterialScopeWhere(user);
  const publications = await prisma.teachingContentPublication.findMany({
    where,
    include: {
      campus: { select: { name: true } },
      content: { include: { author: { select: { name: true, phone: true } } } }
    },
    orderBy: { publishedAt: "desc" },
    take: 100
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">教研中心 · 校区资料</h1>
        <p className="mt-2 text-sm text-muted">按校区查看总部已发布可用资料。</p>
      </section>
      <ContentTabs />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {publications.map((item) => (
          <div key={item.id} className="rounded-lg border border-line bg-white p-5">
            <div className="text-xs text-muted">{item.campus.name} · {teachingContentLabels.type[item.content.type]}</div>
            <div className="mt-2 font-semibold text-ink">{item.content.title}</div>
            <p className="mt-2 text-sm leading-6 text-muted">{item.content.summary || item.content.body?.slice(0, 120) || "暂无摘要"}</p>
            <div className="mt-4 flex gap-2">
              <a href={`/api/content/items/${item.contentId}/export?format=word`} className="rounded-md border border-line px-3 py-2 text-xs">Word</a>
              <a href={`/api/content/items/${item.contentId}/export-pdf`} className="rounded-md border border-line px-3 py-2 text-xs">导出PDF</a>
            </div>
          </div>
        ))}
        {publications.length === 0 ? (
          <div className="rounded-lg border border-line bg-white p-5 text-sm text-muted md:col-span-2 xl:col-span-3">
            暂无校区资料。内容通过审核并发布到校区后，会显示在校区资料中心。
          </div>
        ) : null}
      </div>
    </div>
  );
}
