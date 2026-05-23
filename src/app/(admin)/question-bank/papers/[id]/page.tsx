import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpenCheck, FileStack } from "lucide-react";
import { PaperDeleteButton } from "@/components/question-bank/paper-delete-button";
import { PaperForm } from "@/components/question-bank/paper-form";
import { PaperImportForm } from "@/components/question-bank/paper-import-form";
import { PaperQuestionActions } from "@/components/question-bank/paper-question-actions";
import { QuestionTabs } from "@/components/question-bank/question-tabs";
import { questionBankLabels } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const statusLabels = {
  DRAFT: "草稿",
  PUBLISHED: "发布",
  ARCHIVED: "归档"
} as const;

export default async function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("/question-bank");
  const { id } = await params;
  const paper = await prisma.examPaper.findUnique({
    where: { id },
    include: {
      paperQuestions: {
        orderBy: [{ questionNo: "asc" }, { createdAt: "asc" }],
        include: { _count: { select: { wrongRecords: true, paperItems: true } } }
      },
      questions: { include: { question: true }, orderBy: { sortOrder: "asc" } },
      _count: { select: { paperQuestions: true, questions: true } }
    }
  });
  if (!paper) notFound();

  const directQuestions = paper.paperQuestions;
  const directQuestionIds = new Set(directQuestions.map((question) => question.id));
  const generatedQuestions = paper.questions.map((item) => ({
    ...item.question,
    questionNo: String(item.sortOrder),
    score: item.score
  })).filter((question) => !directQuestionIds.has(question.id));
  const questions = [...directQuestions, ...generatedQuestions];
  const totalScore = questions.reduce((sum, question) => sum + (question.score || 0), 0);
  const typeRows = Object.entries(groupBy(questions.map((question) => label(questionBankLabels.type, question.type))));
  const difficultyRows = Object.entries(groupBy(questions.map((question) => `${question.difficulty}/5`)));

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <Link href="/question-bank/papers" className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" />
          返回试卷管理
        </Link>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{paper.title}</h1>
            <p className="mt-2 text-sm text-muted">
              {label(questionBankLabels.paperType, paper.paperType)} · {questionBankLabels.subject[paper.subject]} · {label(questionBankLabels.paperStage, paper.stage || "")} · {paper.year || "-"}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <Metric label="题量" value={String(questions.length || paper.questionCount)} />
            <Metric label="总分" value={String(totalScore || paper.totalScore)} />
            <Metric label="状态" value={statusLabels[paper.status]} />
          </div>
        </div>
      </section>
      <QuestionTabs />

      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="rounded-lg border border-line bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-ink">试卷基础信息</h2>
              <div className="flex gap-2">
                <PaperQuestionActions paperId={paper.id} defaultSubject={paper.subject} mode="new" />
                <PaperDeleteButton paperId={paper.id} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <Info label="地区" value={paper.region || "-"} />
              <Info label="来源" value={paper.source || "-"} />
              <Info label="考试时长" value={`${paper.durationMinutes} 分钟`} />
              <Info label="难度" value={label(questionBankLabels.paperDifficulty, paper.difficulty)} />
              <Info label="题量统计" value={`${questions.length || paper.questionCount} 题`} />
              <Info label="分值统计" value={`${totalScore || paper.totalScore} 分`} />
            </div>
            {paper.description ? <p className="mt-4 text-sm leading-6 text-muted">{paper.description}</p> : null}
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <StatPanel title="题型统计" rows={typeRows} empty="暂无题型统计" />
            <StatPanel title="难度统计" rows={difficultyRows} empty="暂无难度统计" />
          </section>

          <section className="overflow-hidden rounded-lg border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line p-4">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <BookOpenCheck className="h-4 w-4 text-brand-600" />
                试卷题目
              </div>
              <div className="text-sm text-muted">{questions.length} 题</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-[#F8FAFB] text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">题号</th>
                    <th className="px-4 py-3 font-medium">题干</th>
                    <th className="px-4 py-3 font-medium">题型</th>
                    <th className="px-4 py-3 font-medium">考点</th>
                    <th className="px-4 py-3 font-medium">分值</th>
                    <th className="px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {questions.map((question) => (
                    <tr key={question.id} className="align-top hover:bg-[#FAFBFC]">
                      <td className="whitespace-nowrap px-4 py-3">{question.questionNo || "-"}</td>
                      <td className="px-4 py-3">
                        <Link href={`/question-bank/${question.id}`} className="font-medium text-ink hover:text-brand-700">{question.stem}</Link>
                        <div className="mt-1 text-xs text-muted">答案：{question.answer}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{questionBankLabels.type[question.type]}</td>
                      <td className="px-4 py-3">{question.knowledgePoint}</td>
                      <td className="whitespace-nowrap px-4 py-3">{question.score ?? "-"}</td>
                      <td className="px-4 py-3">
                        {question.paperId === paper.id ? <PaperQuestionActions paperId={paper.id} defaultQuestion={JSON.parse(JSON.stringify(question))} /> : <Link href={`/question-bank/${question.id}`} className="text-brand-700 hover:underline">查看</Link>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {questions.length === 0 ? (
                <div className="border-t border-line p-12 text-center text-sm text-muted">
                  暂无题目，请先成套导入，或点击新增题目手动关联到本试卷。
                </div>
              ) : null}
            </div>
          </section>
        </div>
        <aside className="space-y-4">
          <PaperImportForm paperId={paper.id} />
          <PaperForm value={paper} />
        </aside>
      </section>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#F8FAFB] p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 font-medium text-ink">{value}</div>
    </div>
  );
}

function StatPanel({ title, rows, empty }: { title: string; rows: Array<[string, number]>; empty: string }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-ink">
        <FileStack className="h-4 w-4 text-brand-600" />
        {title}
      </h2>
      <div className="grid gap-2">
        {rows.map(([name, count]) => (
          <div key={name} className="flex items-center justify-between rounded-md bg-[#F8FAFB] px-3 py-2 text-sm">
            <span className="text-muted">{name}</span>
            <span className="font-semibold text-ink">{count}</span>
          </div>
        ))}
        {rows.length === 0 ? <div className="rounded-md bg-[#F8FAFB] p-4 text-sm text-muted">{empty}</div> : null}
      </div>
    </section>
  );
}

function groupBy(values: string[]) {
  return values.reduce<Record<string, number>>((result, value) => {
    result[value] = (result[value] || 0) + 1;
    return result;
  }, {});
}

function label<T extends string>(labels: Record<T, string>, value: string) {
  return labels[value as T] || value || "-";
}
