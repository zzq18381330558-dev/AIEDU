"use client";

import { useRouter } from "next/navigation";
import { Bot, Check, FileDown, Send, Upload } from "lucide-react";

export function ContentActions({ id, campuses }: { id: string; campuses: Array<{ id: string; name: string }> }) {
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
    await post("publish", { campusId });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => post("ai-draft")} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
        <Bot className="h-3.5 w-3.5" />
        AI 初稿
      </button>
      <button onClick={() => post("review", { action: "SUBMIT", comment: "提交审核" })} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
        <Send className="h-3.5 w-3.5" />
        提审
      </button>
      <button onClick={() => post("review", { action: "APPROVE", comment: "审核通过" })} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
        <Check className="h-3.5 w-3.5" />
        通过
      </button>
      <form action={publish} className="flex gap-2">
        <select name="campusId" className="h-8 rounded-md border border-line bg-white px-2 text-xs">
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
      <a href={`/api/content/items/${id}/export?format=pdf`} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
        <FileDown className="h-3.5 w-3.5" />
        PDF
      </a>
    </div>
  );
}
