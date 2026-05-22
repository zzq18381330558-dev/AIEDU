import { QuestionTabs } from "@/components/question-bank/question-tabs";
import { buildWeaknessRows, questionBankLabels } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function WeaknessPage() {
  await requireUser("/question-bank");
  const records = await prisma.wrongQuestionRecord.findMany({
    include: {
      question: {
        select: {
          subject: true,
          chapter: true,
          knowledgePoint: true,
          difficulty: true
        }
      }
    },
    take: 1000
  });
  const rows = buildWeaknessRows(records);

  return (
    <div className="space-y-6">
      <Header title="题库中心 · 知识点薄弱分析" description="按错题记录聚合薄弱知识点，优先暴露未掌握多、难度高的考点。" />
      <QuestionTabs />
      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="错题记录" value={String(records.length)} />
        <Metric label="薄弱知识点" value={String(rows.length)} />
        <Metric label="最高风险分" value={rows[0] ? String(Math.round(rows[0].weaknessScore * 10) / 10) : "0"} />
      </section>
      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8FAFB] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">科目</th>
              <th className="px-4 py-3 font-medium">章节</th>
              <th className="px-4 py-3 font-medium">知识点</th>
              <th className="px-4 py-3 font-medium">错题数</th>
              <th className="px-4 py-3 font-medium">未掌握</th>
              <th className="px-4 py-3 font-medium">平均难度</th>
              <th className="px-4 py-3 font-medium">风险分</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={`${row.subject}-${row.chapter}-${row.knowledgePoint}`}>
                <td className="px-4 py-3">{questionBankLabels.subject[row.subject]}</td>
                <td className="px-4 py-3">{row.chapter}</td>
                <td className="px-4 py-3 font-semibold text-ink">{row.knowledgePoint}</td>
                <td className="px-4 py-3">{row.wrong}</td>
                <td className="px-4 py-3 text-coral">{row.unmastered}</td>
                <td className="px-4 py-3">{row.avgDifficulty}</td>
                <td className="px-4 py-3 text-brand-700">{Math.round(row.weaknessScore * 10) / 10}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <div className="border-t border-line p-12 text-center text-sm text-muted">暂无错题数据，记录学员错题后将自动生成薄弱知识点分析。</div> : null}
      </div>
    </div>
  );
}

function Header({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-3 text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}
