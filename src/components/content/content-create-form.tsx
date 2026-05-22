"use client";

import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { contentTypeOptions } from "@/lib/teaching-content";

export function ContentCreateForm() {
  const router = useRouter();
  async function submit(formData: FormData) {
    const response = await fetch("/api/content/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "创建失败");
      return;
    }
    router.push("/content");
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft">
      <label>
        <span className="text-sm font-medium text-ink">标题</span>
        <input name="title" required className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="text-sm font-medium text-ink">内容类型</span>
          <select name="type" className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm">
            {contentTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium text-ink">内容分类</span>
          <input name="category" defaultValue="教资培训" className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm" />
        </label>
      </div>
      <label>
        <span className="text-sm font-medium text-ink">摘要</span>
        <input name="summary" className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm" />
      </label>
      <label>
        <span className="text-sm font-medium text-ink">AI 生成提示</span>
        <textarea name="aiPrompt" rows={3} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
      </label>
      <label>
        <span className="text-sm font-medium text-ink">正文</span>
        <textarea name="body" rows={12} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
      </label>
      <button type="submit" className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white">
        <Save className="h-4 w-4" />
        保存内容
      </button>
    </form>
  );
}
