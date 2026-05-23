import { ContentTabs } from "@/components/content/content-tabs";
import { KeyPointForm } from "@/components/content/key-point-form";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function KeyPointsPage() {
  await requireUser("/content");
  const keyPoints = await prisma.teachingKeyPoint.findMany({
    orderBy: [{ frequency: "desc" }, { updatedAt: "desc" }],
    take: 200
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">教研中心 · 高频考点库</h1>
        <p className="mt-2 text-sm text-muted">维护科目、章节、命题方向和易错点，让 AI 初稿基于考试规律生成。</p>
      </section>
      <ContentTabs />
      <KeyPointForm />
      <section className="overflow-hidden rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-4 font-semibold text-ink">考点列表</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-[#F8FAFB] text-muted">
              <tr>
                <Th>考点</Th>
                <Th>科目/章节</Th>
                <Th>指数</Th>
                <Th>常考题型</Th>
                <Th>命题方向</Th>
                <Th>易错点</Th>
                <Th>关键词</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {keyPoints.map((item) => (
                <tr key={item.id} className="align-top">
                  <Td className="font-semibold">{item.name}</Td>
                  <Td>{item.subject} · {item.chapter}</Td>
                  <Td>{item.frequency}/5</Td>
                  <Td>{item.questionTypes}</Td>
                  <Td className="max-w-xs whitespace-normal">{item.direction}</Td>
                  <Td className="max-w-xs whitespace-normal">{item.mistakes}</Td>
                  <Td>{item.keywords}</Td>
                </tr>
              ))}
              {keyPoints.length === 0 ? <tr><td colSpan={7} className="px-4 py-12 text-center text-muted">暂无高频考点，请先新增一个考点。</td></tr> : null}
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
