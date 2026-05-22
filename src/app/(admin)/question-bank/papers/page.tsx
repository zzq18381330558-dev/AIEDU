import { QuestionTabs } from "@/components/question-bank/question-tabs";
import { PaperGenerator } from "@/components/question-bank/paper-generator";
import { questionBankLabels } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function PapersPage() {
  await requireUser("/question-bank");
  const papers = await prisma.examPaper.findMany({
    include: {
      questions: { include: { question: true }, orderBy: { sortOrder: "asc" } },
      _count: { select: { questions: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div className="space-y-6">
      <Header title="自动组卷" description="按科目、章节、知识点、难度范围和题目数量自动生成练习卷。" />
      <QuestionTabs />
      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-line bg-white">
          <div className="divide-y divide-line">
            {papers.map((paper) => (
              <div key={paper.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-ink">{paper.title}</div>
                    <div className="mt-1 text-sm text-muted">{questionBankLabels.subject[paper.subject]} · {paper._count.questions} 题 · {paper.durationMinutes} 分钟</div>
                  </div>
                  <div className="text-sm text-brand-700">{paper.status}</div>
                </div>
                <div className="mt-4 grid gap-2">
                  {paper.questions.slice(0, 5).map((item) => (
                    <div key={item.id} className="rounded-md bg-[#F8FAFB] px-3 py-2 text-sm text-muted">
                      {item.sortOrder}. {item.question.stem}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {papers.length === 0 ? <div className="p-12 text-center text-sm text-muted">暂无试卷</div> : null}
          </div>
        </div>
        <PaperGenerator />
      </section>
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
