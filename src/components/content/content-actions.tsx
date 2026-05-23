"use client";

import { useRouter } from "next/navigation";
import { Archive, Bot, Check, FileDown, RotateCcw, Send, Upload } from "lucide-react";

type TemplateOption = { id: string; name: string; subject: string; chapter: string };
type KeyPointOption = { id: string; name: string; subject: string; chapter: string; frequency: number };

export function ContentActions({
  id,
  campuses,
  templates,
  keyPoints
}: {
  id: string;
  campuses: Array<{ id: string; name: string }>;
  templates: TemplateOption[];
  keyPoints: KeyPointOption[];
}) {
  const router = useRouter();

  async function post(path: string, body?: unknown) {
    const response = await fetch(`/api/content/items/${id}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });
    if (!response.ok) {
      alert((await response.json()).error || "操作失败");
      return;
    }
    router.refresh();
  }

  async function publish(formData: FormData) {
    const campusId = String(formData.get("campusId") || "");
    if (!campusId) {
      alert("暂无可发布校区，请先在系统设置中维护校区");
      return;
    }
    await post("publish", { campusId });
  }

  async function generateDraft(formData: FormData) {
    const templateId = String(formData.get("templateId") || "");
    const keyPointIds = formData.getAll("keyPointIds").map(String).filter(Boolean);
    await post("ai-draft", { templateId, keyPointIds });
  }

  return (
    <div className="flex max-w-[420px] flex-wrap gap-2">
      <form action={generateDraft} className="flex flex-wrap gap-2">
        <select name="templateId" className="h-8 max-w-36 rounded-md border border-line bg-white px-2 text-xs">
          <option value="">选择模板</option>
          {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
        </select>
        <select name="keyPointIds" multiple className="h-8 max-w-40 rounded-md border border-line bg-white px-2 text-xs">
          {keyPoints.map((point) => <option key={point.id} value={point.id}>{point.name} {point.frequency}/5</option>)}
        </select>
        <button type="submit" className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
          <Bot className="h-3.5 w-3.5" />
          根据模板生成
        </button>
      </form>
      <button onClick={() => post("review", { action: "SUBMIT", comment: "提交审核" })} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
        <Send className="h-3.5 w-3.5" />
        提审
      </button>
      <button onClick={() => post("review", { action: "APPROVE", comment: "审核通过" })} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
        <Check className="h-3.5 w-3.5" />
        通过
      </button>
      <button onClick={() => post("review", { action: "REJECT", comment: "驳回修改" })} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
        <RotateCcw className="h-3.5 w-3.5" />
        驳回
      </button>
      <button onClick={() => post("review", { action: "ARCHIVE", comment: "废弃内容" })} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
        <Archive className="h-3.5 w-3.5" />
        废弃
      </button>
      <form action={publish} className="flex gap-2">
        <select name="campusId" className="h-8 rounded-md border border-line bg-white px-2 text-xs">
          {campuses.length === 0 ? <option value="">暂无校区</option> : null}
          {campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
        </select>
        <button type="submit" className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
          <Upload className="h-3.5 w-3.5" />
          发布
        </button>
      </form>
      <a href={`/api/content/items/${id}/export?format=word`} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
        <FileDown className="h-3.5 w-3.5" />
        Word
      </a>
      <a href={`/api/content/items/${id}/export-ppt`} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
        <FileDown className="h-3.5 w-3.5" />
        生成PPT
      </a>
      <a href={`/api/content/items/${id}/export-pdf`} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
        <FileDown className="h-3.5 w-3.5" />
        导出PDF
      </a>
    </div>
  );
}
