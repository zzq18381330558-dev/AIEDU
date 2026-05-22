"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, MessageSquarePlus, Save } from "lucide-react";
import {
  attendanceStatusOptions,
  serviceTicketStatusOptions,
  studyStatusOptions
} from "@/lib/student-service";

type Option = { id: string; name: string };

export function StudentStatusForm({
  studentId,
  defaultStatus,
  defaultNote,
  canManage
}: {
  studentId: string;
  defaultStatus: string;
  defaultNote?: string | null;
  canManage: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData) {
    setSaving(true);
    const response = await fetch(`/api/student-service/students/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "保存失败");
      setSaving(false);
      return;
    }
    router.refresh();
    setSaving(false);
  }

  return (
    <form action={submit} className="rounded-lg border border-line bg-white p-4">
      <div className="mb-4 flex items-center gap-2 font-semibold text-ink">
        <Save className="h-4 w-4 text-brand-600" />
        状态流转
      </div>
      <label className="block">
        <span className="text-sm font-medium text-ink">学习状态</span>
        <select name="studyStatus" defaultValue={defaultStatus} disabled={!canManage} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm disabled:bg-[#F8FAFB]">
          {studyStatusOptions.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>
      <label className="mt-3 block">
        <span className="text-sm font-medium text-ink">服务备注</span>
        <textarea name="serviceNote" rows={4} defaultValue={defaultNote || ""} disabled={!canManage} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm disabled:bg-[#F8FAFB]" />
      </label>
      {canManage ? (
        <button disabled={saving} className="mt-4 h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? "保存中..." : "保存状态"}
        </button>
      ) : (
        <div className="mt-4 rounded-md bg-[#F8FAFB] px-3 py-2 text-sm text-muted">当前角色只能查看学员状态。</div>
      )}
    </form>
  );
}

export function ServiceRecordForm({ studentId, canManage }: { studentId: string; canManage: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData) {
    setSaving(true);
    const response = await fetch(`/api/student-service/students/${studentId}/service-records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "保存失败");
      setSaving(false);
      return;
    }
    router.refresh();
    setSaving(false);
  }

  return (
    <form action={submit} className="rounded-lg border border-line bg-white p-4">
      <div className="mb-4 flex items-center gap-2 font-semibold text-ink">
        <MessageSquarePlus className="h-4 w-4 text-brand-600" />
        新增服务记录
      </div>
      <input name="title" required disabled={!canManage} placeholder="记录标题" className="h-10 w-full rounded-md border border-line px-3 text-sm disabled:bg-[#F8FAFB]" />
      <select name="status" disabled={!canManage} className="mt-3 h-10 w-full rounded-md border border-line bg-white px-3 text-sm disabled:bg-[#F8FAFB]">
        {serviceTicketStatusOptions.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
      <textarea name="content" required disabled={!canManage} rows={4} placeholder="记录服务沟通、问题、处理结果或后续动作" className="mt-3 w-full rounded-md border border-line px-3 py-2 text-sm disabled:bg-[#F8FAFB]" />
      <button disabled={!canManage || saving} className="mt-4 h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
        {saving ? "保存中..." : "保存服务记录"}
      </button>
    </form>
  );
}

export function StudentAttendanceForm({
  studentId,
  sessions,
  canManage
}: {
  studentId: string;
  sessions: Option[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData) {
    setSaving(true);
    const payload = Object.fromEntries(formData.entries());
    payload.studentId = studentId;
    const response = await fetch("/api/student-service/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "登记失败");
      setSaving(false);
      return;
    }
    router.refresh();
    setSaving(false);
  }

  return (
    <form action={submit} className="rounded-lg border border-line bg-white p-4">
      <div className="mb-4 flex items-center gap-2 font-semibold text-ink">
        <ClipboardCheck className="h-4 w-4 text-brand-600" />
        登记打卡
      </div>
      <select name="courseSessionId" disabled={!canManage || sessions.length === 0} className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm disabled:bg-[#F8FAFB]">
        {sessions.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
        {sessions.length === 0 ? <option value="">暂无可登记课程</option> : null}
      </select>
      <select name="status" disabled={!canManage || sessions.length === 0} className="mt-3 h-10 w-full rounded-md border border-line bg-white px-3 text-sm disabled:bg-[#F8FAFB]">
        {attendanceStatusOptions.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
      <input name="checkInAt" type="datetime-local" disabled={!canManage || sessions.length === 0} className="mt-3 h-10 w-full rounded-md border border-line px-3 text-sm disabled:bg-[#F8FAFB]" />
      <textarea name="note" rows={3} disabled={!canManage || sessions.length === 0} placeholder="到课情况、缺课原因或补课安排" className="mt-3 w-full rounded-md border border-line px-3 py-2 text-sm disabled:bg-[#F8FAFB]" />
      <button disabled={!canManage || sessions.length === 0 || saving} className="mt-4 h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
        {saving ? "保存中..." : "保存打卡"}
      </button>
    </form>
  );
}
