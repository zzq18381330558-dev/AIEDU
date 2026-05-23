import { BookOpenCheck } from "lucide-react";
import { QuestionDashboard } from "@/components/question-bank/question-dashboard";
import { QuestionTabs } from "@/components/question-bank/question-tabs";
import { canManageQuestionBank } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function QuestionBankPage() {
  const user = await requireUser("/question-bank");
  const [questions, total, aiCount, wrongCount] = await Promise.all([
    prisma.question.findMany({
      include: {
        bank: { select: { id: true, name: true } },
        paper: { select: { id: true, title: true } },
        _count: { select: { wrongRecords: true, paperItems: true } }
      },
      orderBy: { updatedAt: "desc" },
      take: 100
    }),
    prisma.question.count(),
    prisma.question.count({ where: { analysis: { not: null } } }),
    prisma.wrongQuestionRecord.count()
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white shadow-soft">
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <BookOpenCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-ink">题库中心</h1>
              <p className="mt-2 text-sm text-muted">统一沉淀真题、模拟题、高频考点和错题数据，支持解析生成与自动组卷。</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <Metric label="题目" value={String(total)} />
            <Metric label="AI 解析" value={`${total ? Math.round((aiCount / total) * 100) : 0}%`} />
            <Metric label="错题" value={String(wrongCount)} />
          </div>
        </div>
        <QuestionTabs />
      </section>

      <QuestionDashboard initialQuestions={JSON.parse(JSON.stringify(questions))} canManage={canManageQuestionBank(user.role)} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line px-4 py-2">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-lg font-semibold text-ink">{value}</div>
    </div>
  );
}
