import { QuestionTabs } from "@/components/question-bank/question-tabs";
import { questionBankLabels } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function WrongQuestionsPage() {
  await requireUser("/question-bank");
  const records = await prisma.wrongQuestionRecord.findMany({
    include: {
      student: { select: { name: true, school: true } },
      question: true
    },
    orderBy: { wrongAt: "desc" },
    take: 100
  });

  return (
    <div className="space-y-6">
      <Header title="错题本" description="沉淀学员错题、错误原因和掌握状态，供教务和教研复盘。" />
      <QuestionTabs />
      <div className="rounded-lg border border-line bg-white">
        <div className="divide-y divide-line">
          {records.map((record) => (
            <div key={record.id} className="grid gap-4 p-5 lg:grid-cols-[220px_1fr_180px]">
              <div>
                <div className="font-semibold text-ink">{record.student.name}</div>
                <div className="mt-1 text-sm text-muted">{record.student.school || "-"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-ink">{record.question.stem}</div>
                <div className="mt-2 text-xs text-muted">{questionBankLabels.subject[record.question.subject]} · {record.question.chapter} · {record.question.knowledgePoint}</div>
                <div className="mt-2 text-xs text-muted">错因：{record.reason || "未填写"}</div>
              </div>
              <div className="text-sm">
                <div className={record.mastered ? "text-brand-700" : "text-coral"}>{record.mastered ? "已掌握" : "未掌握"}</div>
                <div className="mt-2 text-muted">{record.wrongAt.toLocaleDateString("zh-CN")}</div>
              </div>
            </div>
          ))}
          {records.length === 0 ? <div className="p-12 text-center text-sm text-muted">暂无错题记录</div> : null}
        </div>
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
