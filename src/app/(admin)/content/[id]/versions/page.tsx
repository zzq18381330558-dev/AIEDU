import { notFound } from "next/navigation";
import { ContentTabs } from "@/components/content/content-tabs";
import { teachingContentLabels } from "@/lib/teaching-content";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function ContentVersionsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("/content");
  const { id } = await params;
  const content = await prisma.teachingContent.findUnique({
    where: { id },
    include: {
      versions: { orderBy: { version: "desc" } },
      reviews: { include: { reviewer: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      exports: { orderBy: { createdAt: "desc" } }
    }
  });
  if (!content) notFound();

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">教研中心 · 版本记录</h1>
        <div className="mt-2 font-semibold text-ink">{content.title}</div>
        <p className="mt-2 text-sm text-muted">{teachingContentLabels.type[content.type]} · {teachingContentLabels.status[content.status]} · 当前 v{content.currentVersion}</p>
      </section>
      <ContentTabs />
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-line bg-white">
          <div className="border-b border-line px-5 py-4 font-semibold text-ink">版本记录</div>
          <div className="divide-y divide-line">
            {content.versions.map((version) => (
              <div key={version.id} className="p-5">
                <div className="font-semibold text-ink">v{version.version} · {version.title}</div>
                <div className="mt-1 text-xs text-muted">{version.createdAt.toLocaleString("zh-CN")} · {version.changeNote || "-"}</div>
                <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-[#F8FAFB] p-3 text-xs leading-5 text-muted">{version.body}</pre>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Side title="审核流程">
            {content.reviews.map((review) => <div key={review.id} className="border-b border-line py-3 text-sm"><div className="font-medium text-ink">{teachingContentLabels.reviewAction[review.action]}</div><div className="text-xs text-muted">{review.reviewer.name} · {review.createdAt.toLocaleString("zh-CN")}</div><div className="mt-1 text-muted">{review.comment || "-"}</div></div>)}
          </Side>
          <Side title="导出记录">
            {content.exports.map((item) => <div key={item.id} className="border-b border-line py-3 text-sm"><div className="font-medium text-ink">{item.fileName}</div><div className="text-xs text-muted">{item.format} · {item.createdAt.toLocaleString("zh-CN")}</div></div>)}
          </Side>
        </div>
      </section>
    </div>
  );
}

function Side({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-line bg-white p-4"><div className="font-semibold text-ink">{title}</div><div className="mt-2">{children}</div></div>;
}
