import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, FileStack, NotebookPen } from "lucide-react";
import { QuestionTabs } from "@/components/question-bank/question-tabs";
import { WrongQuestionForm } from "@/components/question-bank/wrong-question-form";
import { questionBankLabels } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("/question-bank");
  const { id } = await params;
  const [question, students] = await Promise.all([
    prisma.question.findUnique({
      where: { id },
      include: {
        bank: { select: { name: true } },
        paperItems: { include: { paper: { select: { id: true, title: true } } }, take: 8 },
        wrongRecords: {
          include: { student: { select: { name: true, school: true } } },
          orderBy: { wrongAt: "desc" },
          take: 10
        },
        _count: { select: { wrongRecords: true, paperItems: true } }
      }
    }),
    prisma.student.findMany({
      select: { id: true, name: true, school: true },
      orderBy: { enrolledAt: "desc" },
      take: 100
    })
  ]);

  if (!question) notFound();

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <Link href="/question-bank" className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" />
          返回题目列表
        </Link>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">题目详情</h1>
            <p className="mt-2 text-sm text-muted">{questionBankLabels.subject[question.subject]} · {question.chapter} · {question.knowledgePoint}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <Metric label="错题记录" value={String(question._count.wrongRecords)} />
            <Metric label="组卷引用" value={String(question._count.paperItems)} />
          </div>
        </div>
      </section>
      <QuestionTabs />

      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Panel title="题干">
            <div className="whitespace-pre-wrap text-sm leading-7 text-ink">{question.stem}</div>
          </Panel>
          <Panel title="分类信息">
            <div className="grid gap-3 text-sm md:grid-cols-3">
              <Info label="科目" value={questionBankLabels.subject[question.subject]} />
              <Info label="章节" value={question.chapter} />
              <Info label="知识点" value={question.knowledgePoint} />
              <Info label="题型" value={questionBankLabels.type[question.type]} />
              <Info label="难度" value={`${question.difficulty}/5`} />
              <Info label="来源" value={questionBankLabels.source[question.source]} />
              <Info label="年份" value={question.year ? String(question.year) : "-"} />
              <Info label="标签" value={question.highFrequencyTags.length ? question.highFrequencyTags.join("、") : "-"} />
              <Info label="题库" value={question.bank?.name || "-"} />
            </div>
          </Panel>
          <Panel title="选项与答案">
            <Options value={question.options} />
            <div className="mt-4 rounded-md bg-[#F8FAFB] p-3 text-sm text-ink">正确答案：{question.answer}</div>
          </Panel>
          <Panel title="AI 解析">
            {question.analysis ? (
              <div className="whitespace-pre-wrap text-sm leading-7 text-ink">{question.analysis}</div>
            ) : (
              <div className="flex items-center gap-2 rounded-md bg-[#F8FAFB] p-4 text-sm text-muted">
                <Bot className="h-4 w-4" />
                暂无解析，可在题目列表点击 AI 解析生成并保存。
              </div>
            )}
          </Panel>
        </div>
        <aside className="space-y-4">
          <WrongQuestionForm questionId={question.id} students={students} />
          <Panel title="最近错题">
            <div className="grid gap-3">
              {question.wrongRecords.map((record) => (
                <div key={record.id} className="rounded-md border border-line p-3 text-sm">
                  <div className="font-medium text-ink">{record.student.name}</div>
                  <div className="mt-1 text-xs text-muted">{record.student.school || "-"} · {record.mastered ? "已掌握" : "未掌握"}</div>
                  <div className="mt-2 text-xs text-muted">错因：{record.reason || "未填写"}</div>
                </div>
              ))}
              {question.wrongRecords.length === 0 ? <Empty icon={NotebookPen} text="暂无错题记录" /> : null}
            </div>
          </Panel>
          <Panel title="关联试卷">
            <div className="grid gap-3">
              {question.paperItems.map((item) => (
                <div key={item.id} className="rounded-md border border-line p-3 text-sm text-ink">
                  {item.paper.title}
                </div>
              ))}
              {question.paperItems.length === 0 ? <Empty icon={FileStack} text="暂无关联试卷" /> : null}
            </div>
          </Panel>
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <h2 className="mb-4 font-semibold text-ink">{title}</h2>
      {children}
    </section>
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

function Options({ value }: { value: unknown }) {
  if (!value) return <div className="text-sm text-muted">本题暂无选项</div>;
  if (Array.isArray(value)) {
    return (
      <div className="grid gap-2">
        {value.map((item, index) => {
          const option = item && typeof item === "object" ? item as { key?: unknown; text?: unknown } : null;
          const key = option?.key ? String(option.key) : String.fromCharCode(65 + index);
          const text = option?.text ? String(option.text) : String(item);
          return <div key={`${key}-${index}`} className="rounded-md border border-line px-3 py-2 text-sm text-ink">{key}. {text}</div>;
        })}
      </div>
    );
  }
  return <pre className="overflow-x-auto rounded-md bg-[#F8FAFB] p-3 text-sm text-ink">{JSON.stringify(value, null, 2)}</pre>;
}

function Empty({ icon: Icon, text }: { icon: typeof NotebookPen; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-[#F8FAFB] p-4 text-sm text-muted">
      <Icon className="h-4 w-4" />
      {text}
    </div>
  );
}
