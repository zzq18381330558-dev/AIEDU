"use client";

import { useRouter } from "next/navigation";
import { Download, FileUp, Plus } from "lucide-react";
import {
  attendanceStatusOptions,
  sessionTypeOptions,
  studentImportHeaders,
  studentImportRequiredHeaders,
  studyStatusOptions
} from "@/lib/student-service";
import { examTrackOptions } from "@/lib/crm";
import { getUserDisplayName } from "@/lib/user-display";

type Option = { id: string; name?: string | null; email?: string | null; phone?: string | null };

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
      alert((await response.json()).error || "新建失败");
      return;
    }
    router.refresh();
  }
  return (
    <div className="space-y-4">
      <FormShell title="新建学员">
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
      <StudentImportForm />
    </div>
  );
}

function StudentImportForm() {
  const router = useRouter();

  async function importFile(formData: FormData) {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      alert("请选择要导入的文件");
      return;
    }
    const headers = await readImportHeaders(file);
    const missingHeaders = studentImportRequiredHeaders.filter((header) => !headers.includes(header));
    if (missingHeaders.length) {
      alert(`导入文件缺少关键列：${missingHeaders.join("、")}。请下载模板后按表头填写。`);
      return;
    }

    const response = await fetch("/api/student-service/import", {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "导入失败");
      return;
    }
    const firstErrors = Array.isArray(data.errors) && data.errors.length
      ? `\n失败明细：${data.errors.slice(0, 3).map((item: { row: number; message: string }) => `第 ${item.row} 行 ${item.message}`).join("；")}`
      : "";
    alert(`导入完成：成功 ${data.success} 条，失败 ${data.failed} 条${firstErrors}`);
    router.refresh();
  }

  return (
    <form action={importFile} className="rounded-lg border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <FileUp className="h-4 w-4 text-brand-600" />
          Excel 导入
        </div>
        <a href="/api/student-service/import/template" className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs text-ink">
          <Download className="h-3.5 w-3.5" />
          下载模板
        </a>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">按模板填写，必填列：姓名、手机号。支持表头：{studentImportHeaders.join("、")}。</p>
      <input name="file" type="file" accept=".xlsx" required className="mt-3 w-full text-sm" />
      <button type="submit" className="mt-4 h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white">上传导入</button>
    </form>
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
      alert((await response.json()).error || "新建失败");
      return;
    }
    router.refresh();
  }
  return (
    <FormShell title="新建班级">
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
      alert((await response.json()).error || "新建失败");
      return;
    }
    router.refresh();
  }
  return (
    <FormShell title="新建课程">
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
          {getUserDisplayName(option, option.name || "-")}
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

function Submit({ label = "新建" }: { label?: string }) {
  return (
    <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white">
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

async function readImportHeaders(file: File) {
  const xlsx = await import("xlsx");
  const workbook = xlsx.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false });
  return (rows[0] || []).map((item) => String(item).trim()).filter(Boolean);
}
