"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  examTrackOptions,
  intentLevelOptions,
  leadStatusOptions,
  sourceChannelOptions
} from "@/lib/crm";

type Option = { id: string; name: string };

export type LeadModalValue = {
  id?: string;
  name?: string;
  phone?: string;
  wechat?: string | null;
  school?: string | null;
  grade?: string | null;
  major?: string | null;
  examTrack?: string;
  sourceChannel?: string;
  campusId?: string;
  assigneeId?: string | null;
  intentLevel?: string;
  status?: string;
  nextFollowUpAt?: string | null;
  note?: string | null;
};

function dateTimeLocalValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function LeadModal({
  open,
  value,
  campuses,
  counselors,
  onClose,
  onSaved
}: {
  open: boolean;
  value: LeadModalValue | null;
  campuses: Option[];
  counselors: Option[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  if (!open) return null;
  const editing = Boolean(value?.id);

  async function submit(formData: FormData) {
    setSaving(true);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch(editing ? `/api/crm/leads/${value?.id}` : "/api/crm/leads", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      alert(data.error || "保存失败");
      setSaving(false);
      return;
    }
    await onSaved();
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">{editing ? "编辑线索" : "新建线索"}</h2>
          <button onClick={onClose} className="rounded-md p-2 text-muted hover:bg-[#F2F4F7]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form action={submit} className="grid gap-4 p-5 md:grid-cols-2">
          <Field label="姓名" name="name" required defaultValue={value?.name} />
          <Field label="手机号" name="phone" required defaultValue={value?.phone} />
          <Field label="微信号" name="wechat" defaultValue={value?.wechat} />
          <Field label="学校" name="school" defaultValue={value?.school} />
          <Field label="年级" name="grade" defaultValue={value?.grade} />
          <Field label="专业" name="major" defaultValue={value?.major} />
          <Select label="教资方向" name="examTrack" options={examTrackOptions} defaultValue={value?.examTrack || "PRIMARY"} />
          <Select
            label="来源渠道"
            name="sourceChannel"
            options={sourceChannelOptions}
            defaultValue={value?.sourceChannel || "OTHER"}
          />
          <Select label="所属校区" name="campusId" options={campuses.map((item) => ({ value: item.id, label: item.name }))} defaultValue={value?.campusId || campuses[0]?.id} />
          <Select
            label="招生老师"
            name="assigneeId"
            options={[{ value: "", label: "暂不分配" }, ...counselors.map((item) => ({ value: item.id, label: item.name }))]}
            defaultValue={value?.assigneeId || ""}
          />
          <Select
            label="意向等级"
            name="intentLevel"
            options={intentLevelOptions}
            defaultValue={value?.intentLevel || "MEDIUM"}
          />
          <Select label="跟进状态" name="status" options={leadStatusOptions} defaultValue={value?.status || "UNCONTACTED"} />
          <Field
            label="下次跟进时间"
            name="nextFollowUpAt"
            type="datetime-local"
            defaultValue={dateTimeLocalValue(value?.nextFollowUpAt)}
          />
          <label className="md:col-span-2">
            <span className="text-sm font-medium text-ink">备注</span>
            <textarea
              name="note"
              defaultValue={value?.note || ""}
              rows={4}
              className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <div className="flex justify-end gap-3 md:col-span-2">
            <button type="button" onClick={onClose} className="h-10 rounded-md border border-line px-4 text-sm text-muted">
              取消
            </button>
            <button disabled={saving} type="submit" className="h-10 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue || ""}
        className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
  defaultValue
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
}) {
  return (
    <label>
      <span className="text-sm font-medium text-ink">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
