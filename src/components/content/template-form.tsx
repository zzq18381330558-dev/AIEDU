"use client";

import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { contentTypeOptions } from "@/lib/teaching-content";

export function TemplateForm() {
  const router = useRouter();

  async function submit(formData: FormData) {
    const response = await fetch("/api/content/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "模板保存失败");
      return;
    }
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="模板名称" name="name" placeholder="综合素质讲义模板" required />
        <label>
          <span className="text-sm font-medium text-ink">内容类型</span>
          <select name="type" className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm">
            {contentTypeOptions.filter((item) => ["COURSE_HANDOUT", "PPT_OUTLINE", "MOCK_PAPER", "WRITING_TEMPLATE"].includes(item.value)).map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <Field label="适用科目" name="subject" placeholder="综合素质" required />
        <Field label="适用章节" name="chapter" placeholder="职业理念" required />
      </div>
      <label>
        <span className="text-sm font-medium text-ink">模板结构 Markdown</span>
        <textarea
          name="structureMarkdown"
          required
          rows={10}
          defaultValue={"## 教学目标\n\n## 高频考点\n\n## 命题方向\n\n## 易错提醒\n\n## 课堂练习\n\n## 课后任务"}
          className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input name="enabled" type="checkbox" value="true" defaultChecked className="h-4 w-4" />
        启用模板
      </label>
      <button type="submit" className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white">
        <Save className="h-4 w-4" />
        保存模板
      </button>
    </form>
  );
}

function Field({ label, name, placeholder, required = false }: { label: string; name: string; placeholder?: string; required?: boolean }) {
  return (
    <label>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input name={name} placeholder={placeholder} required={required} className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm" />
    </label>
  );
}
