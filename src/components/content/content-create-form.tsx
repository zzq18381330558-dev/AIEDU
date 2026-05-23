"use client";

import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { contentTypeOptions } from "@/lib/teaching-content";

type TemplateOption = { id: string; name: string; subject: string; chapter: string; type: string };
type KeyPointOption = { id: string; name: string; subject: string; chapter: string; frequency: number };

export function ContentCreateForm({ templates, keyPoints }: { templates: TemplateOption[]; keyPoints: KeyPointOption[] }) {
  const router = useRouter();
  async function submit(formData: FormData, generateDraft = false) {
    const body: Record<string, unknown> = Object.fromEntries(formData.entries());
    body.keyPointIds = formData.getAll("keyPointIds").map(String);
    if (generateDraft) body.generateDraft = "true";
    const response = await fetch("/api/content/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "新建失败");
      return;
    }
    router.push("/content");
    router.refresh();
  }

  return (
    <form action={(formData) => submit(formData)} className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft">
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
        <textarea name="aiPrompt" rows={3} placeholder="可补充授课要求；根据模板生成时，系统会优先使用模板结构和高频考点。" className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
      </label>
      <section className="rounded-md border border-line bg-[#F8FAFB] p-4">
        <div className="text-sm font-semibold text-ink">模板驱动生成</div>
        <p className="mt-1 text-xs text-muted">选择模板和考点后，AI 初稿只按模板结构、命题方向和易错点输出。</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label>
            <span className="text-sm font-medium text-ink">选择模板</span>
            <select name="templateId" className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm">
              <option value="">暂不选择模板</option>
              {templates.map((template) => <option key={template.id} value={template.id}>{template.name} · {template.subject}/{template.chapter}</option>)}
            </select>
          </label>
          <label>
            <span className="text-sm font-medium text-ink">选择高频考点</span>
            <select name="keyPointIds" multiple className="mt-2 h-28 w-full rounded-md border border-line bg-white px-3 py-2 text-sm">
              {keyPoints.map((point) => <option key={point.id} value={point.id}>{point.name} · {point.subject}/{point.chapter} · {point.frequency}/5</option>)}
            </select>
          </label>
        </div>
        {templates.length === 0 || keyPoints.length === 0 ? <div className="mt-3 text-xs text-muted">暂无可用模板或考点时，可先到教研模板库、高频考点库维护数据。</div> : null}
      </section>
      <label>
        <span className="text-sm font-medium text-ink">正文</span>
        <textarea name="body" rows={12} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white">
          <Save className="h-4 w-4" />
          新建内容
        </button>
        <button type="button" onClick={(event) => {
          if (event.currentTarget.form) void submit(new FormData(event.currentTarget.form), true);
        }} className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-line px-4 text-sm font-semibold text-ink">
          <Save className="h-4 w-4" />
          根据模板生成并新建
        </button>
      </div>
    </form>
  );
}
