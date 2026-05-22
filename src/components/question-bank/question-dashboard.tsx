"use client";

import { useState } from "react";
import { Bot, FileUp, Pencil, Plus, RefreshCw, Search } from "lucide-react";
import { QuestionModal, type QuestionValue } from "@/components/question-bank/question-modal";
import { questionBankLabels, questionTypeOptions, subjectOptions } from "@/lib/question-bank";

type QuestionItem = QuestionValue & {
  id: string;
  subject: keyof typeof questionBankLabels.subject;
  type: keyof typeof questionBankLabels.type;
  source: keyof typeof questionBankLabels.source;
  chapter: string;
  knowledgePoint: string;
  stem: string;
  answer: string;
  difficulty: number;
  highFrequencyTags: string[];
  _count?: { wrongRecords: number; paperItems: number };
};

export function QuestionDashboard({ initialQuestions, canManage }: { initialQuestions: QuestionItem[]; canManage: boolean }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionItem | null>(null);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");

  async function reload() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (subject) params.set("subject", subject);
    if (type) params.set("type", type);
    const response = await fetch(`/api/question-bank/questions?${params}`);
    const data = await response.json();
    setQuestions(data.items || []);
  }

  async function aiAnalysis(id: string) {
    const response = await fetch(`/api/question-bank/questions/${id}/ai-analysis`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "生成失败");
      return;
    }
    setQuestions((items) => items.map((item) => (item.id === id ? data.item : item)));
  }

  async function importFile(formData: FormData) {
    const response = await fetch("/api/question-bank/import", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "导入失败");
      return;
    }
    alert(`导入完成：成功 ${data.success} 条，失败 ${data.failed} 条`);
    reload();
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-line bg-white p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索题干、章节、知识点" className="h-10 w-full rounded-md border border-line pl-9 pr-3 text-sm" />
          </div>
          <select value={subject} onChange={(event) => setSubject(event.target.value)} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
            <option value="">全部科目</option>
            {subjectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select value={type} onChange={(event) => setType(event.target.value)} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
            <option value="">全部题型</option>
            {questionTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <button onClick={reload} className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm">
            <RefreshCw className="h-4 w-4" />
            查询
          </button>
          {canManage ? (
            <button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
              新增题目
            </button>
          ) : null}
        </div>
      </section>

      {canManage ? (
        <form action={importFile} className="flex flex-col gap-3 rounded-lg border border-line bg-white p-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <FileUp className="h-4 w-4 text-brand-600" />
            批量导入
          </div>
          <p className="flex-1 text-xs text-muted">表头：科目、章节、知识点、题型、题干、选项、正确答案、解析、难度、高频标签、来源、年份</p>
          <input name="file" type="file" accept=".xlsx,.xls,.csv" required className="text-sm" />
          <button type="submit" className="h-9 rounded-md border border-line px-3 text-sm">上传</button>
        </form>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="bg-[#F8FAFB] text-muted">
              <tr>
                <Th>题干</Th>
                <Th>科目</Th>
                <Th>章节/知识点</Th>
                <Th>题型</Th>
                <Th>难度</Th>
                <Th>标签</Th>
                <Th>来源</Th>
                <Th>年份</Th>
                <Th>错题</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {questions.map((item) => (
                <tr key={item.id} className="align-top hover:bg-[#FAFBFC]">
                  <Td className="max-w-xl whitespace-normal">
                    <div className="font-medium">{item.stem}</div>
                    <div className="mt-2 text-xs text-muted">答案：{item.answer}</div>
                    {item.analysis ? <div className="mt-2 line-clamp-2 text-xs text-muted">{item.analysis}</div> : null}
                  </Td>
                  <Td>{questionBankLabels.subject[item.subject]}</Td>
                  <Td>{item.chapter}<div className="text-xs text-muted">{item.knowledgePoint}</div></Td>
                  <Td>{questionBankLabels.type[item.type]}</Td>
                  <Td>{item.difficulty}/5</Td>
                  <Td>{item.highFrequencyTags?.join("、") || "-"}</Td>
                  <Td>{questionBankLabels.source[item.source]}</Td>
                  <Td>{item.year || "-"}</Td>
                  <Td>{item._count?.wrongRecords || 0}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      {canManage ? (
                        <>
                          <button onClick={() => aiAnalysis(item.id)} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
                            <Bot className="h-3.5 w-3.5" />
                            AI 解析
                          </button>
                          <button onClick={() => { setEditing(item); setOpen(true); }} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
                            <Pencil className="h-3.5 w-3.5" />
                            编辑
                          </button>
                        </>
                      ) : "-"}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <QuestionModal open={open} value={editing} onClose={() => setOpen(false)} onSaved={reload} />
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-4 py-3 text-ink ${className}`}>{children}</td>;
}
