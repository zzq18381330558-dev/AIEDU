import { ContentTabs } from "@/components/content/content-tabs";
import { TemplateForm } from "@/components/content/template-form";
import { teachingContentLabels } from "@/lib/teaching-content";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function TemplatesPage() {
  await requireUser("/content");
  const templates = await prisma.teachingContentTemplate.findMany({
    orderBy: [{ enabled: "desc" }, { updatedAt: "desc" }],
    take: 100
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">教研中心 · 教研模板库</h1>
        <p className="mt-2 text-sm text-muted">维护讲义、PPT 文案、试卷和作文模板的标准结构，用于约束 AI 初稿生成。</p>
      </section>
      <ContentTabs />
      <TemplateForm />
      <section className="overflow-hidden rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-4 font-semibold text-ink">模板列表</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#F8FAFB] text-muted">
              <tr>
                <Th>模板名称</Th>
                <Th>科目/章节</Th>
                <Th>内容类型</Th>
                <Th>状态</Th>
                <Th>更新时间</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {templates.map((item) => (
                <tr key={item.id}>
                  <Td className="max-w-md whitespace-normal">
                    <div className="font-semibold text-ink">{item.name}</div>
                    <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap rounded-md bg-[#F8FAFB] p-3 text-xs text-muted">{item.structureMarkdown}</pre>
                  </Td>
                  <Td>{item.subject} · {item.chapter}</Td>
                  <Td>{teachingContentLabels.type[item.type]}</Td>
                  <Td>{item.enabled ? "启用" : "停用"}</Td>
                  <Td>{item.updatedAt.toLocaleString("zh-CN")}</Td>
                </tr>
              ))}
              {templates.length === 0 ? <tr><td colSpan={5} className="px-4 py-12 text-center text-muted">暂无教研模板，请先新增一个模板。</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-4 py-3 text-ink ${className}`}>{children}</td>;
}
