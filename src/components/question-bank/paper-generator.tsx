"use client";

import { useRouter } from "next/navigation";
import { FileStack } from "lucide-react";
import { questionTypeOptions, subjectOptions } from "@/lib/question-bank";

export function PaperGenerator() {
  const router = useRouter();
  async function submit(formData: FormData) {
    const response = await fetch("/api/question-bank/papers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(formData.entries()), mode: "auto-generate" })
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "组卷失败");
      return;
    }
    alert(`组卷成功：${data.item.questions.length} 道题`);
    router.refresh();
  }

  return (
    <section className="rounded-lg border border-line bg-white p-4">
      <div className="mb-4 flex items-center gap-2 font-semibold text-ink">
        <FileStack className="h-4 w-4 text-brand-600" />
        自动组卷
      </div>
      <form action={submit} className="grid gap-3">
        <input name="title" placeholder="试卷名称" className="h-10 rounded-md border border-line px-3 text-sm" />
        <select name="subject" className="h-10 rounded-md border border-line bg-white px-3 text-sm">
          {subjectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select name="type" className="h-10 rounded-md border border-line bg-white px-3 text-sm">
          <option value="">全部题型</option>
          {questionTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <input name="chapter" placeholder="章节，可空" className="h-10 rounded-md border border-line px-3 text-sm" />
        <input name="knowledgePoint" placeholder="知识点，可空" className="h-10 rounded-md border border-line px-3 text-sm" />
        <input name="tags" placeholder="标签，可用逗号分隔" className="h-10 rounded-md border border-line px-3 text-sm" />
        <div className="grid grid-cols-3 gap-2">
          <input name="count" type="number" defaultValue="20" min="1" max="100" className="h-10 rounded-md border border-line px-3 text-sm" />
          <input name="difficultyFrom" type="number" defaultValue="1" min="1" max="5" className="h-10 rounded-md border border-line px-3 text-sm" />
          <input name="difficultyTo" type="number" defaultValue="5" min="1" max="5" className="h-10 rounded-md border border-line px-3 text-sm" />
        </div>
        <button type="submit" className="h-10 rounded-md bg-brand-600 text-sm font-semibold text-white">生成试卷</button>
      </form>
    </section>
  );
}
