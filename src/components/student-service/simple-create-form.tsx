"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  attendanceStatusOptions,
  sessionTypeOptions,
  studyStatusOptions
} from "@/lib/student-service";
import { examTrackOptions } from "@/lib/crm";

type Option = { id: string; name: string };

export function StudentCreateForm({
  campuses,
  classes,
  academicUsers,
  salesUsers
}: {
  campuses: Option[];
  classes: Option[];
  academicUsers: Option[];
  salesUsers: Option[];
}) {
  const router = useRouter();
  async function submit(formData: FormData) {
    const response = await fetch("/api/student-service/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    if (!response.ok) {
      alert((await response.json()).error || "创建失败");
      return;
    }
    router.refresh();
  }
  return (
    <FormShell title="新增学员">
      <form action={submit} className="grid gap-3">
        <Input name="name" placeholder="姓名" required />
        <Input name="phone" placeholder="手机号" required />
        <Input name="school" placeholder="学校" />
        <Input name="grade" placeholder="年级" />
        <Input name="major" placeholder="专业" />
        <Input name="classType" placeholder="报名班型" />
        <Select name="campusId" options={campuses} />
        <Select name="classId" options={[{ id: "", name: "暂不分班" }, ...classes]} />
        <Select name="academicOwnerId" options={[{ id: "", name: "暂不分配教务" }, ...academicUsers]} />
        <Select name="salesOwnerId" options={[{ id: "", name: "无招生老师" }, ...salesUsers]} />
        <NativeSelect name="examTrack" options={examTrackOptions} />
        <NativeSelect name="studyStatus" options={studyStatusOptions} />
        <textarea name="serviceNote" placeholder="服务备注" className="rounded-md border border-line px-3 py-2 text-sm" />
        <Submit />
      </form>
    </FormShell>
  );
}

export function ClassCreateForm({
  campuses,
  academicUsers,
  lecturers
}: {
  campuses: Option[];
  academicUsers: Option[];
  lecturers: Option[];
}) {
  const router = useRouter();
  async function submit(formData: FormData) {
    const response = await fetch("/api/student-service/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    if (!response.ok) {
      alert((await response.json()).error || "创建失败");
      return;
    }
    router.refresh();
  }
  return (
    <FormShell title="新增班级">
      <form action={submit} className="grid gap-3">
        <Input name="name" placeholder="班级名称" required />
        <Input name="startAt" type="datetime-local" required />
        <Input name="classType" placeholder="班型" />
        <Select name="campusId" options={campuses} />
        <Select name="academicOwnerId" options={[{ id: "", name: "暂不分配教务" }, ...academicUsers]} />
        <Select name="lecturerId" options={[{ id: "", name: "暂不分配授课老师" }, ...lecturers]} />
        <NativeSelect name="examTrack" options={examTrackOptions} />
        <Submit />
      </form>
    </FormShell>
  );
}

export function SessionCreateForm({
  campuses,
  classes,
  lecturers
}: {
  campuses: Option[];
  classes: Option[];
  lecturers: Option[];
}) {
  const router = useRouter();
  async function submit(formData: FormData) {
    const response = await fetch("/api/student-service/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    if (!response.ok) {
      alert((await response.json()).error || "创建失败");
      return;
    }
    router.refresh();
  }
  return (
    <FormShell title="新增课程">
      <form action={submit} className="grid gap-3">
        <Input name="title" placeholder="课程标题" required />
        <Select name="campusId" options={campuses} />
        <Select name="classId" options={classes} />
        <Select name="lecturerId" options={[{ id: "", name: "暂不分配老师" }, ...lecturers]} />
        <NativeSelect name="type" options={sessionTypeOptions} />
        <Input name="startsAt" type="datetime-local" required />
        <Input name="endsAt" type="datetime-local" required />
        <Input name="room" placeholder="教室/会议链接" />
        <textarea name="homework" placeholder="作业提醒内容" className="rounded-md border border-line px-3 py-2 text-sm" />
        <Submit />
      </form>
    </FormShell>
  );
}

export function AttendanceCreateForm({
  students,
  sessions
}: {
  students: Option[];
  sessions: Option[];
}) {
  const router = useRouter();
  async function submit(formData: FormData) {
    const response = await fetch("/api/student-service/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    if (!response.ok) {
      alert((await response.json()).error || "登记失败");
      return;
    }
    router.refresh();
  }
  return (
    <FormShell title="登记打卡">
      <form action={submit} className="grid gap-3">
        <Select name="studentId" options={students} />
        <Select name="courseSessionId" options={sessions} />
        <NativeSelect name="status" options={attendanceStatusOptions} />
        <Input name="checkInAt" type="datetime-local" />
        <textarea name="note" placeholder="备注" className="rounded-md border border-line px-3 py-2 text-sm" />
        <Submit label="保存记录" />
      </form>
    </FormShell>
  );
}

function FormShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-4">
      <h2 className="mb-4 font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Input({
  name,
  placeholder,
  type = "text",
  required
}: {
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      className="h-10 rounded-md border border-line px-3 text-sm outline-none focus:border-brand-500"
    />
  );
}

function Select({ name, options }: { name: string; options: Option[] }) {
  return (
    <select name={name} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
      {options.map((option) => (
        <option key={option.id || "empty"} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}

function NativeSelect({ name, options }: { name: string; options: Array<{ value: string; label: string }> }) {
  return (
    <select name={name} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function Submit({ label = "创建" }: { label?: string }) {
  return (
    <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white">
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}
