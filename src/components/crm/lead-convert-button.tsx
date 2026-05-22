"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

export function LeadConvertButton({
  leadId,
  converted
}: {
  leadId: string;
  converted: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function convert() {
    if (converted || saving) return;
    const confirmed = window.confirm("确认将该成交线索转入学员服务系统？");
    if (!confirmed) return;
    setSaving(true);
    const response = await fetch(`/api/crm/leads/${leadId}/convert`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "转学员失败");
      setSaving(false);
      return;
    }
    router.refresh();
    setSaving(false);
  }

  return (
    <button
      type="button"
      onClick={convert}
      disabled={converted || saving}
      className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#D9DEE3] disabled:text-muted"
    >
      <UserPlus className="h-4 w-4" />
      {converted ? "已转学员" : saving ? "转入中..." : "成交转学员"}
    </button>
  );
}
