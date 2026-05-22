"use client";

import { X } from "lucide-react";
import {
  questionSourceOptions,
  questionTypeOptions,
  subjectOptions
} from "@/lib/question-bank";

export type QuestionValue = {
  id?: string;
  subject?: string;
  chapter?: string;
  knowledgePoint?: string;
  type?: string;
  stem?: string;
  options?: unknown;
  answer?: string;
  analysis?: string | null;
  difficulty?: number;
  highFrequencyTags?: string[];
  source?: string;
  year?: number | null;
};

function optionsText(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === "object" && "key" in item && "text" in item) {
          return `${String(item.key)}. ${String(item.text)}`;
        }
        return String(item);
      })
      .join("\n");
  }
  return JSON.stringify(value, null, 2);
}

export function QuestionModal({
  open,
  value,
  onClose,
  onSaved
}: {
  open: boolean;
  value: QuestionValue | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  if (!open) return null;
  const editing = Boolean(value?.id);

  async function submit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch(editing ? `/api/question-bank/questions/${value?.id}` : "/api/question-bank/questions", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      alert((await response.json()).error || "保存失败");
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">{editing ? "编辑题目" : "新增题目"}</h2>
          <button onClick={onClose} className="rounded-md p-2 text-muted hover:bg-[#F2F4F7]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form action={submit} className="grid gap-4 p-5 md:grid-cols-2">
          <Select label="科目" name="subject" options={subjectOptions} defaultValue={value?.subject || "COMPREHENSIVE_QUALITY"} />
          <Select label="题型" name="type" options={questionTypeOptions} defaultValue={value?.type || "SINGLE_CHOICE"} />
          <Field label="章节" name="chapter" defaultValue={value?.chapter} required />
          <Field label="知识点" name="knowledgePoint" defaultValue={value?.knowledgePoint} required />
          <Field label="难度" name="difficulty" type="number" defaultValue={String(value?.difficulty || 3)} />
          <Select label="来源" name="source" options={questionSourceOptions} defaultValue={value?.source || "ORIGINAL"} />
          <Field label="年份" name="year" type="number" defaultValue={value?.year ? String(value.year) : ""} />
          <Field label="高频标签" name="highFrequencyTags" defaultValue={value?.highFrequencyTags?.join("，")} />
          <TextArea label="题干" name="stem" defaultValue={value?.stem} required />
          <TextArea label="选项" name="options" defaultValue={optionsText(value?.options)} />
          <TextArea label="正确答案" name="answer" defaultValue={value?.answer} required />
          <TextArea label="解析" name="analysis" defaultValue={value?.analysis || ""} />
          <div className="flex justify-end gap-3 md:col-span-2">
            <button type="button" onClick={onClose} className="h-10 rounded-md border border-line px-4 text-sm text-muted">取消</button>
            <button type="submit" className="h-10 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, defaultValue, type = "text", required }: { label: string; name: string; defaultValue?: string; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input name={name} type={type} required={required} defaultValue={defaultValue || ""} className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-brand-500" />
    </label>
  );
}

function Select({ label, name, options, defaultValue }: { label: string; name: string; options: Array<{ value: string; label: string }>; defaultValue: string }) {
  return (
    <label>
      <span className="text-sm font-medium text-ink">{label}</span>
      <select name={name} defaultValue={defaultValue} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm">
        {options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </label>
  );
}

function TextArea({ label, name, defaultValue, required }: { label: string; name: string; defaultValue?: string; required?: boolean }) {
  return (
    <label className="md:col-span-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      <textarea name={name} required={required} defaultValue={defaultValue || ""} rows={4} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-500" />
    </label>
  );
}
