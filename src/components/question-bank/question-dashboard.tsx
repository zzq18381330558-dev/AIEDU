"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Download, Eye, FileUp, Pencil, Plus, RefreshCw, Search } from "lucide-react";
import { QuestionModal, type QuestionValue } from "@/components/question-bank/question-modal";
import {
  questionBankLabels,
  questionImportHeaders,
  questionImportRequiredHeaders,
  questionSourceOptions,
  questionTypeOptions,
  subjectOptions
} from "@/lib/question-bank";

type QuestionItem = QuestionValue & {
  id: string;
  paperId?: string | null;
  questionNo?: string | null;
  score?: number | null;
  paper?: { id: string; title: string } | null;
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
  const [source, setSource] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [knowledgePoint, setKnowledgePoint] = useState("");
  const [tag, setTag] = useState("");

  async function reload() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (subject) params.set("subject", subject);
    if (type) params.set("type", type);
    if (source) params.set("source", source);
    if (difficulty) params.set("difficulty", difficulty);
    if (knowledgePoint) params.set("knowledgePoint", knowledgePoint);
    if (tag) params.set("tag", tag);
    const response = await fetch(`/api/question-bank/questions?${params}`);
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "查询失败");
      return;
    }
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
    const file = formData.get("file");
    if (!(file instanceof File)) {
      alert("请选择要导入的文件");
      return;
    }
    const headers = await readImportHeaders(file);
    const missingHeaders = questionImportRequiredHeaders.filter((header) => !headers.includes(header));
    if (missingHeaders.length) {
      alert(`导入文件缺少关键列：${missingHeaders.join("、")}。请下载模板后按表头填写。`);
      return;
    }

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
          <select value={source} onChange={(event) => setSource(event.target.value)} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
            <option value="">全部来源</option>
            {questionSourceOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
            <option value="">全部难度</option>
            {[1, 2, 3, 4, 5].map((item) => <option key={item} value={item}>{item}/5</option>)}
          </select>
          <input value={knowledgePoint} onChange={(event) => setKnowledgePoint(event.target.value)} placeholder="知识点" className="h-10 rounded-md border border-line px-3 text-sm" />
          <input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="标签" className="h-10 rounded-md border border-line px-3 text-sm" />
          <button onClick={reload} className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm">
            <RefreshCw className="h-4 w-4" />
            查询
          </button>
          {canManage ? (
            <button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
              新建题目
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
          <p className="flex-1 text-xs leading-5 text-muted">按模板填写，必填列：题干、正确答案。表头：{questionImportHeaders.join("、")}</p>
          <a href="/api/question-bank/import/template" className="inline-flex h-9 items-center gap-1 rounded-md border border-line px-3 text-sm text-ink">
            <Download className="h-4 w-4" />
            下载模板
          </a>
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
                <Th>所属试卷</Th>
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
                  <Td>
                    {item.paper ? <Link href={`/question-bank/papers/${item.paper.id}`} className="text-brand-700 hover:underline">{item.paper.title}</Link> : "-"}
                    {item.questionNo ? <div className="text-xs text-muted">题号 {item.questionNo} · {item.score ?? "-"} 分</div> : null}
                  </Td>
                  <Td>{questionBankLabels.type[item.type]}</Td>
                  <Td>{item.difficulty}/5</Td>
                  <Td>{item.highFrequencyTags?.join("、") || "-"}</Td>
                  <Td>{questionBankLabels.source[item.source]}</Td>
                  <Td>{item.year || "-"}</Td>
                  <Td>{item._count?.wrongRecords || 0}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/question-bank/${item.id}`} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
                        <Eye className="h-3.5 w-3.5" />
                        详情
                      </Link>
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
                      ) : null}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          {questions.length === 0 ? (
            <div className="border-t border-line p-12 text-center text-sm text-muted">
              暂无题目，请调整筛选条件或新建题目。
            </div>
          ) : null}
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

async function readImportHeaders(file: File) {
  if (file.name.toLowerCase().endsWith(".csv")) {
    const text = await file.text();
    const [headerLine = ""] = text.split(/\r?\n/);
    return headerLine.split(",").map((item) => item.trim()).filter(Boolean);
  }

  const xlsx = await import("xlsx");
  const workbook = xlsx.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false });
  return (rows[0] || []).map((item) => String(item).trim()).filter(Boolean);
}
