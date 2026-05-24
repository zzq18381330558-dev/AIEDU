"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { crmLabels, intentLevelOptions, leadStatusOptions } from "@/lib/crm";
import { getUserDisplayName } from "@/lib/user-display";
import { RequiredLabel } from "@/components/ui/required-label";

type FollowUp = {
  id: string;
  content: string;
  status: string;
  intentLevel: string;
  followAt: string;
  nextAt?: string | null;
  creator?: { name?: string | null; phone?: string | null };
};

function dateTimeLocalValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function FollowUpPanel({
  leadId,
  initialItems,
  defaultStatus = "CONTACTED",
  defaultIntentLevel = "MEDIUM",
  defaultNextAt
}: {
  leadId: string;
  initialItems: FollowUp[];
  defaultStatus?: string;
  defaultIntentLevel?: string;
  defaultNextAt?: string | null;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData) {
    setSaving(true);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch(`/api/crm/leads/${leadId}/follow-ups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "保存失败");
      setSaving(false);
      return;
    }
    setItems([data.item, ...items]);
    router.refresh();
    setSaving(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form action={submit} className="rounded-lg border border-line bg-white p-5" key={items[0]?.id || "empty"}>
        <div className="flex items-center gap-2 font-semibold text-ink">
          <Plus className="h-4 w-4 text-brand-600" />
          新建跟进记录
        </div>
        <label className="mt-4 block">
          <RequiredLabel>跟进内容</RequiredLabel>
          <textarea name="content" rows={5} required className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-500" />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-ink">跟进状态</span>
          <select name="status" defaultValue={defaultStatus} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm">
            {leadStatusOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-ink">意向等级</span>
          <select name="intentLevel" defaultValue={defaultIntentLevel} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm">
            {intentLevelOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-ink">下次跟进时间</span>
          <input name="nextAt" type="datetime-local" defaultValue={dateTimeLocalValue(defaultNextAt)} className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm" />
        </label>
        <button disabled={saving} type="submit" className="mt-5 h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? "保存中..." : "保存跟进"}
        </button>
      </form>

      <div className="rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-4 font-semibold text-ink">跟进时间线</div>
        <div className="divide-y divide-line">
          {items.map((item) => (
            <div key={item.id} className="p-5">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-semibold text-ink">{getUserDisplayName(item.creator, "系统")}</span>
                <span className="text-muted">{new Date(item.followAt).toLocaleString("zh-CN")}</span>
                <span className="rounded-md bg-brand-50 px-2 py-1 text-xs text-brand-700">
                  {crmLabels.status[item.status as keyof typeof crmLabels.status]}
                </span>
                <span className="rounded-md bg-[#F2F4F7] px-2 py-1 text-xs text-muted">
                  意向 {crmLabels.intentLevel[item.intentLevel as keyof typeof crmLabels.intentLevel]}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">{item.content}</p>
              {item.nextAt ? <div className="mt-3 text-xs text-muted">下次跟进：{new Date(item.nextAt).toLocaleString("zh-CN")}</div> : null}
            </div>
          ))}
          {items.length === 0 ? <div className="p-12 text-center text-sm text-muted">暂无跟进记录</div> : null}
        </div>
      </div>
    </div>
  );
}
