"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, MessageSquarePlus, Save } from "lucide-react";
import {
  attendanceStatusOptions,
  serviceTicketStatusOptions,
  studyStatusOptions
} from "@/lib/student-service";
import { examTrackOptions } from "@/lib/crm";
import { isValidIdNumberFormat } from "@/lib/id-number";
import { RequiredLabel } from "@/components/ui/required-label";

type Option = { id: string; name: string };
type ProfileOption = { id: string; name?: string | null };

export function StudentProfileForm({
  student,
  campuses,
  classes,
  academicUsers,
  salesUsers,
  canManage
}: {
  student: {
    id: string;
    name: string;
    phone: string;
    idNumber?: string | null;
    school?: string | null;
    grade?: string | null;
    major?: string | null;
    classType?: string | null;
    campusId: string;
    classId?: string | null;
    academicOwnerId?: string | null;
    salesOwnerId?: string | null;
    examTrack: string;
    studyStatus: string;
    serviceNote?: string | null;
  };
  campuses: ProfileOption[];
  classes: ProfileOption[];
  academicUsers: ProfileOption[];
  salesUsers: ProfileOption[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData) {
    const idNumber = String(formData.get("idNumber") || "").trim().toUpperCase();
    if (idNumber && !isValidIdNumberFormat(idNumber)) {
      alert("身份证号格式不正确");
      return;
    }

    setSaving(true);
    const response = await fetch(`/api/student-service/students/${student.id}`, {
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
        编辑学员资料
      </div>
      <div className="grid gap-3">
        <Field label="学员姓名" name="name" required defaultValue={student.name} disabled={!canManage} />
        <Field label="手机号" name="phone" required defaultValue={student.phone} disabled={!canManage} />
        <Field label="身份证号" name="idNumber" defaultValue={student.idNumber || ""} disabled={!canManage} />
        <ProfileSelect label="校区" name="campusId" required options={campuses} defaultValue={student.campusId} disabled={!canManage} />
        <ProfileSelect label="班级" name="classId" options={[{ id: "", name: "未分班" }, ...classes]} defaultValue={student.classId || ""} disabled={!canManage} />
        <ProfileSelect label="教务老师" name="academicOwnerId" options={[{ id: "", name: "未分配" }, ...academicUsers]} defaultValue={student.academicOwnerId || ""} disabled={!canManage} />
        <ProfileSelect label="招生老师" name="salesOwnerId" options={[{ id: "", name: "未分配" }, ...salesUsers]} defaultValue={student.salesOwnerId || ""} disabled={!canManage} />
        <NativeSelect label="教资方向" name="examTrack" options={examTrackOptions} defaultValue={student.examTrack} disabled={!canManage} />
        <NativeSelect label="学习状态" name="studyStatus" options={studyStatusOptions} defaultValue={student.studyStatus} disabled={!canManage} />
        <Field label="学校" name="school" defaultValue={student.school || ""} disabled={!canManage} />
        <Field label="年级" name="grade" defaultValue={student.grade || ""} disabled={!canManage} />
        <Field label="专业" name="major" defaultValue={student.major || ""} disabled={!canManage} />
        <Field label="报名班型" name="classType" defaultValue={student.classType || ""} disabled={!canManage} />
        <label>
          <RequiredLabel required={false}>服务备注</RequiredLabel>
          <textarea name="serviceNote" rows={3} defaultValue={student.serviceNote || ""} disabled={!canManage} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm disabled:bg-[#F8FAFB]" />
        </label>
      </div>
      {canManage ? (
        <button disabled={saving} className="mt-4 h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? "保存中..." : "保存资料"}
        </button>
      ) : null}
    </form>
  );
}

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
        <RequiredLabel required={false}>学习状态</RequiredLabel>
        <select name="studyStatus" defaultValue={defaultStatus} disabled={!canManage} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm disabled:bg-[#F8FAFB]">
          {studyStatusOptions.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>
      <label className="mt-3 block">
        <RequiredLabel required={false}>服务备注</RequiredLabel>
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
        新建服务记录
      </div>
      <Field label="记录标题" name="title" required disabled={!canManage} />
      <select name="status" disabled={!canManage} className="mt-3 h-10 w-full rounded-md border border-line bg-white px-3 text-sm disabled:bg-[#F8FAFB]">
        {serviceTicketStatusOptions.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
      <label className="mt-3 block">
        <RequiredLabel>记录内容</RequiredLabel>
        <textarea name="content" required disabled={!canManage} rows={4} placeholder="记录服务沟通、问题、处理结果或后续动作" className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm disabled:bg-[#F8FAFB]" />
      </label>
      <button disabled={!canManage || saving} className="mt-4 h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
        {saving ? "保存中..." : "保存服务记录"}
      </button>
    </form>
  );
}

function Field({ label, name, required, defaultValue, disabled, type = "text" }: { label: string; name: string; required?: boolean; defaultValue?: string; disabled?: boolean; type?: string }) {
  return (
    <label>
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <input name={name} type={type} required={required} defaultValue={defaultValue} disabled={disabled} className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm disabled:bg-[#F8FAFB]" />
    </label>
  );
}

function ProfileSelect({
  label,
  name,
  required,
  options,
  defaultValue,
  disabled
}: {
  label: string;
  name: string;
  required?: boolean;
  options: ProfileOption[];
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <label>
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <select name={name} required={required} defaultValue={defaultValue} disabled={disabled} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm disabled:bg-[#F8FAFB]">
        {options.map((item) => (
          <option key={`${name}-${item.id || "empty"}`} value={item.id}>{item.name || "-"}</option>
        ))}
      </select>
    </label>
  );
}

function NativeSelect({
  label,
  name,
  options,
  defaultValue,
  disabled
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <label>
      <RequiredLabel required={false}>{label}</RequiredLabel>
      <select name={name} defaultValue={defaultValue} disabled={disabled} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm disabled:bg-[#F8FAFB]">
        {options.map((item) => (
          <option key={`${name}-${item.value}`} value={item.value}>{item.label}</option>
        ))}
      </select>
    </label>
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
      <label className="block">
        <RequiredLabel>课程</RequiredLabel>
        <select name="courseSessionId" required disabled={!canManage || sessions.length === 0} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm disabled:bg-[#F8FAFB]">
          {sessions.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
          {sessions.length === 0 ? <option value="">暂无可登记课程</option> : null}
        </select>
      </label>
      <label className="mt-3 block">
        <RequiredLabel required={false}>打卡状态</RequiredLabel>
        <select name="status" disabled={!canManage || sessions.length === 0} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm disabled:bg-[#F8FAFB]">
          {attendanceStatusOptions.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>
      <Field label="打卡时间" name="checkInAt" type="datetime-local" disabled={!canManage || sessions.length === 0} />
      <label className="mt-3 block">
        <RequiredLabel required={false}>备注</RequiredLabel>
        <textarea name="note" rows={3} disabled={!canManage || sessions.length === 0} placeholder="到课情况、缺课原因或补课安排" className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm disabled:bg-[#F8FAFB]" />
      </label>
      <button disabled={!canManage || sessions.length === 0 || saving} className="mt-4 h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
        {saving ? "保存中..." : "保存打卡"}
      </button>
    </form>
  );
}
