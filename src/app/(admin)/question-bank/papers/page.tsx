import Link from "next/link";
import { Eye } from "lucide-react";
import { PaperDeleteButton } from "@/components/question-bank/paper-delete-button";
import { PaperForm } from "@/components/question-bank/paper-form";
import { PaperGenerator } from "@/components/question-bank/paper-generator";
import { QuestionTabs } from "@/components/question-bank/question-tabs";
import { questionBankLabels } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const paperStatusLabels = {
  DRAFT: "草稿",
  PUBLISHED: "发布",
  ARCHIVED: "归档"
} as const;

export default async function PapersPage() {
  await requireUser("/question-bank");
  const papers = await prisma.examPaper.findMany({
    include: {
      paperQuestions: { select: { id: true, type: true, score: true }, orderBy: [{ questionNo: "asc" }, { createdAt: "asc" }] },
      questions: { include: { question: true }, orderBy: { sortOrder: "asc" } },
      _count: { select: { paperQuestions: true, questions: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 80
  });

  return (
    <div className="space-y-6">
      <Header title="题库中心 · 试卷管理" description="按试卷管理真题卷、模拟卷、专项卷，并支持 Excel 成套导入题目。" />
      <QuestionTabs />
      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-line bg-white">
          <div className="divide-y divide-line">
            {papers.map((paper) => {
              const directCount = paper._count.paperQuestions;
              const generatedCount = paper._count.questions;
              const questionCount = directCount || generatedCount || paper.questionCount;
              const directScore = paper.paperQuestions.reduce((sum, question) => sum + (question.score || 0), 0);
              const generatedScore = paper.questions.reduce((sum, item) => sum + item.score, 0);
              const actualScore = directScore || generatedScore || paper.totalScore;
              return (
                <div key={paper.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link href={`/question-bank/papers/${paper.id}`} className="font-semibold text-ink hover:text-brand-700">{paper.title}</Link>
                      <div className="mt-1 text-sm text-muted">
                        {questionBankLabels.subject[paper.subject]} · {label(questionBankLabels.paperType, paper.paperType)} · {paper.year || "-"} · {questionCount} 题 · {actualScore} 分
                      </div>
                      <div className="mt-2 text-xs text-muted">{paper.region || "未填写地区"} · {paper.source || "未填写来源"} · {paper.durationMinutes} 分钟</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-brand-700">{paperStatusLabels[paper.status]}</span>
                      <Link href={`/question-bank/papers/${paper.id}`} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
                        <Eye className="h-3.5 w-3.5" />
                        详情
                      </Link>
                      <PaperDeleteButton paperId={paper.id} />
                    </div>
                  </div>
                </div>
              );
            })}
            {papers.length === 0 ? <div className="p-12 text-center text-sm text-muted">暂无试卷，请先新建试卷或保留使用自动组卷。</div> : null}
          </div>
        </div>
        <aside className="space-y-4">
          <PaperForm />
          <PaperGenerator />
        </aside>
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

function label<T extends string>(labels: Record<T, string>, value: string) {
  return labels[value as T] || value;
}
