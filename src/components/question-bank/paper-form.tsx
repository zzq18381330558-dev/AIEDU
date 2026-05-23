"use client";

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import {
  paperDifficultyOptions,
  paperStageOptions,
  paperTypeOptions,
  subjectOptions
} from "@/lib/question-bank";

export type PaperValue = {
  id?: string;
  title?: string;
  paperType?: string;
  subject?: string;
  stage?: string | null;
  year?: number | null;
  region?: string | null;
  source?: string | null;
  totalScore?: number;
  durationMinutes?: number;
  difficulty?: string;
  description?: string | null;
  status?: string;
};

export function PaperForm({ value }: { value?: PaperValue | null }) {
  const router = useRouter();
  const editing = Boolean(value?.id);

  async function submit(formData: FormData) {
    const response = await fetch(editing ? `/api/question-bank/papers/${value?.id}` : "/api/question-bank/papers", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "试卷保存失败");
      return;
    }
    router.refresh();
    if (!editing) router.push(`/question-bank/papers/${data.item.id}`);
  }

  return (
    <section className="rounded-lg border border-line bg-white p-4">
      <div className="mb-4 flex items-center gap-2 font-semibold text-ink">
        <FileText className="h-4 w-4 text-brand-600" />
        {editing ? "编辑试卷" : "新建试卷"}
      </div>
      <form action={submit} className="grid gap-3">
        <input name="name" required defaultValue={value?.title || ""} placeholder="试卷名称" className="h-10 rounded-md border border-line px-3 text-sm" />
        <select name="type" defaultValue={value?.paperType || "REAL_EXAM"} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
          {paperTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select name="subject" defaultValue={value?.subject || "COMPREHENSIVE_QUALITY"} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
          {subjectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select name="stage" defaultValue={value?.stage || "MIDDLE"} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
          {paperStageOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input name="year" type="number" defaultValue={value?.year || ""} placeholder="年份" className="h-10 rounded-md border border-line px-3 text-sm" />
          <input name="region" defaultValue={value?.region || ""} placeholder="地区" className="h-10 rounded-md border border-line px-3 text-sm" />
        </div>
        <input name="source" defaultValue={value?.source || ""} placeholder="来源，如教育部考试院" className="h-10 rounded-md border border-line px-3 text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <input name="totalScore" type="number" defaultValue={value?.totalScore || 150} placeholder="总分" className="h-10 rounded-md border border-line px-3 text-sm" />
          <input name="duration" type="number" defaultValue={value?.durationMinutes || 120} placeholder="时长" className="h-10 rounded-md border border-line px-3 text-sm" />
        </div>
        <select name="difficulty" defaultValue={value?.difficulty || "MEDIUM"} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
          {paperDifficultyOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select name="status" defaultValue={value?.status || "DRAFT"} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
          <option value="DRAFT">草稿</option>
          <option value="PUBLISHED">发布</option>
          <option value="ARCHIVED">归档</option>
        </select>
        <textarea name="description" defaultValue={value?.description || ""} placeholder="试卷说明" rows={3} className="rounded-md border border-line px-3 py-2 text-sm" />
        <button type="submit" className="h-10 rounded-md bg-brand-600 text-sm font-semibold text-white">保存试卷</button>
      </form>
    </section>
  );
}
