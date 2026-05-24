"use client";

import { useRouter } from "next/navigation";
import { Download, FileUp, Pencil, Plus, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  attendanceStatusOptions,
  sessionTypeOptions,
  studentImportHeaders,
  studentImportRequiredHeaders,
  studyStatusOptions
} from "@/lib/student-service";
import { examTrackOptions } from "@/lib/crm";
import { isValidIdNumberFormat } from "@/lib/id-number";
import { getUserDisplayName } from "@/lib/user-display";
import { RequiredLabel } from "@/components/ui/required-label";

type Option = { id: string; name?: string | null; phone?: string | null };
type CourseOption = Option & { campusId?: string | null };
type ClassValue = {
  id: string;
  name: string;
  campusId: string;
  courseId: string;
  startAt: Date | string;
  academicOwnerId?: string | null;
  lecturerId?: string | null;
  classType?: string | null;
  examTrack: string;
};

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
    if (!validateOptionalIdNumber(formData.get("idNumber"))) return;
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
          <Input name="name" label="姓名" required />
          <Input name="phone" label="手机号" required />
          <Input name="idNumber" label="身份证号" />
          <Input name="school" label="学校" />
          <Input name="grade" label="年级" />
          <Input name="major" label="专业" />
          <Input name="classType" label="报名班型" />
          <Select name="campusId" label="校区" required options={campuses} />
          <Select name="classId" label="班级" options={[{ id: "", name: "暂不分班" }, ...classes]} />
          <Select name="academicOwnerId" label="教务老师" options={[{ id: "", name: "暂不分配教务" }, ...academicUsers]} />
          <Select name="salesOwnerId" label="招生老师" options={[{ id: "", name: "无招生老师" }, ...salesUsers]} />
          <NativeSelect name="examTrack" label="教资方向" options={examTrackOptions} />
          <NativeSelect name="studyStatus" label="学习状态" options={studyStatusOptions} />
          <label>
            <RequiredLabel required={false}>服务备注</RequiredLabel>
            <textarea name="serviceNote" className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
          </label>
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
  courses,
  academicUsers,
  lecturers
}: {
  campuses: Option[];
  courses: CourseOption[];
  academicUsers: Option[];
  lecturers: Option[];
}) {
  const router = useRouter();
  const [campusId, setCampusId] = useState(campuses[0]?.id || "");
  const filteredCourses = useMemo(() => filterCoursesByCampus(courses, campusId), [courses, campusId]);
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
        <Input name="name" label="班级名称" required />
        <Input name="startAt" label="开课时间" type="datetime-local" required />
        <Input name="classType" label="班型" />
        <Select name="campusId" label="校区" required options={campuses} value={campusId} onChange={setCampusId} />
        <Select key={`course-${campusId}`} name="courseId" label="课程" required options={filteredCourses} />
        <Select name="academicOwnerId" label="教务老师" options={[{ id: "", name: "暂不分配教务" }, ...academicUsers]} />
        <Select name="lecturerId" label="授课老师" options={[{ id: "", name: "暂不分配授课老师" }, ...lecturers]} />
        <NativeSelect name="examTrack" label="教资方向" options={examTrackOptions} />
        <Submit />
      </form>
    </FormShell>
  );
}

export function ClassEditForm({
  value,
  campuses,
  courses,
  academicUsers,
  lecturers
}: {
  value: ClassValue;
  campuses: Option[];
  courses: CourseOption[];
  academicUsers: Option[];
  lecturers: Option[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [campusId, setCampusId] = useState(value.campusId);
  const filteredCourses = useMemo(() => filterCoursesByCampus(courses, campusId), [courses, campusId]);

  async function submit(formData: FormData) {
    const response = await fetch(`/api/student-service/classes/${value.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    if (!response.ok) {
      alert((await response.json()).error || "班级保存失败");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs text-ink">
        <Pencil className="h-3.5 w-3.5" />
        编辑
      </button>
    );
  }
  return (
    <form action={submit} className="grid min-w-72 gap-3 rounded-md border border-line bg-[#F8FAFB] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-ink">编辑班级</div>
        <button type="button" onClick={() => setOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      <Input name="name" label="班级名称" required defaultValue={value.name} />
      <Input name="startAt" label="开课时间" type="datetime-local" required defaultValue={formatDateTimeLocal(value.startAt)} />
      <Input name="classType" label="班型" defaultValue={value.classType || ""} />
      <Select name="campusId" label="校区" required options={campuses} value={campusId} onChange={setCampusId} />
      <Select key={`course-${campusId}`} name="courseId" label="课程" required options={filteredCourses} defaultValue={filteredCourses.some((course) => course.id === value.courseId) ? value.courseId : ""} />
      <Select name="academicOwnerId" label="教务老师" options={[{ id: "", name: "暂不分配教务" }, ...academicUsers]} defaultValue={value.academicOwnerId || ""} />
      <Select name="lecturerId" label="授课老师" options={[{ id: "", name: "暂不分配授课老师" }, ...lecturers]} defaultValue={value.lecturerId || ""} />
      <NativeSelect name="examTrack" label="教资方向" options={examTrackOptions} defaultValue={value.examTrack} />
      <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white">
        <Save className="h-4 w-4" />
        保存
      </button>
    </form>
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
        <Input name="title" label="课程标题" required />
        <Select name="campusId" label="校区" required options={campuses} />
        <Select name="classId" label="班级" required options={classes} />
        <Select name="lecturerId" label="授课老师" options={[{ id: "", name: "暂不分配老师" }, ...lecturers]} />
        <NativeSelect name="type" label="课程类型" options={sessionTypeOptions} />
        <Input name="startsAt" label="开始时间" type="datetime-local" required />
        <Input name="endsAt" label="结束时间" type="datetime-local" required />
        <Input name="room" label="教室/会议链接" />
        <label>
          <RequiredLabel required={false}>作业提醒内容</RequiredLabel>
          <textarea name="homework" className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
        </label>
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
        <Select name="studentId" label="学员" required options={students} />
        <Select name="courseSessionId" label="课程" required options={sessions} />
        <NativeSelect name="status" label="打卡状态" options={attendanceStatusOptions} />
        <Input name="checkInAt" label="打卡时间" type="datetime-local" />
        <label>
          <RequiredLabel required={false}>备注</RequiredLabel>
          <textarea name="note" className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
        </label>
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
  label,
  type = "text",
  required,
  defaultValue
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label>
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue || ""}
        className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-brand-500"
      />
    </label>
  );
}

function Select({
  name,
  label,
  required,
  options,
  defaultValue,
  value,
  onChange
}: {
  name: string;
  label: string;
  required?: boolean;
  options: Option[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label>
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <select
        name={name}
        required={required}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm"
      >
        {options.map((option) => (
          <option key={option.id || "empty"} value={option.id}>
            {getUserDisplayName(option, option.name || "-")}
          </option>
        ))}
      </select>
    </label>
  );
}

function NativeSelect({ name, label, options, defaultValue }: { name: string; label: string; options: Array<{ value: string; label: string }>; defaultValue?: string }) {
  return (
    <label>
      <RequiredLabel required={false}>{label}</RequiredLabel>
      <select name={name} defaultValue={defaultValue} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function filterCoursesByCampus(courses: CourseOption[], campusId: string) {
  return courses.filter((course) => !course.campusId || course.campusId === campusId);
}

function formatDateTimeLocal(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

function validateOptionalIdNumber(value: FormDataEntryValue | null) {
  const idNumber = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (idNumber && !isValidIdNumberFormat(idNumber)) {
    alert("身份证号格式不正确");
    return false;
  }
  return true;
}
