"use client";

import { useRouter } from "next/navigation";
import { Pencil, Plus, Save, X } from "lucide-react";
import { useState } from "react";
import { courseStatusOptions } from "@/lib/courses";
import { examTrackOptions } from "@/lib/crm";
import { RequiredLabel } from "@/components/ui/required-label";

type Option = { id: string; name: string };
type CourseValue = {
  id?: string;
  name?: string;
  code?: string;
  description?: string | null;
  examTrack?: string;
  category?: string;
  price?: unknown;
  status?: string;
  isPublished?: boolean;
  campusId?: string | null;
};
type ChapterValue = { id: string; title: string; description?: string | null; sortOrder: number };
type LessonValue = {
  id: string;
  title: string;
  summary?: string | null;
  durationMinutes: number;
  sortOrder: number;
  teachingContentId?: string | null;
  questionPaperId?: string | null;
};

export function CourseForm({ value, campuses, canManage }: { value?: CourseValue | null; campuses: Option[]; canManage: boolean }) {
  const router = useRouter();
  const editing = Boolean(value?.id);

  async function submit(formData: FormData) {
    const response = await fetch(editing ? `/api/courses/${value?.id}` : "/api/courses", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "课程保存失败");
      return;
    }
    router.refresh();
    if (!editing) router.push(`/courses/${data.item.id}`);
  }

  if (!canManage) return null;
  return (
    <form action={submit} className="grid gap-3 rounded-lg border border-line bg-white p-4">
      <div className="flex items-center gap-2 font-semibold text-ink">
        {editing ? <Save className="h-4 w-4 text-brand-600" /> : <Plus className="h-4 w-4 text-brand-600" />}
        {editing ? "编辑课程" : "新建课程"}
      </div>
      <Input name="name" label="课程名称" required defaultValue={value?.name} />
      <Input name="code" label="课程编码" required defaultValue={value?.code} />
      <Input name="category" label="课程分类" required defaultValue={value?.category || "教师资格证"} />
      <Select name="campusId" label="所属校区" options={[{ id: "", name: "总部课程" }, ...campuses]} defaultValue={value?.campusId || ""} />
      <NativeSelect name="examTrack" label="教资方向" options={examTrackOptions} defaultValue={value?.examTrack || "PRIMARY"} />
      <Input name="price" label="价格" type="number" defaultValue={String(value?.price ?? 0)} />
      <NativeSelect name="status" label="状态" options={courseStatusOptions} defaultValue={value?.status || "ACTIVE"} />
      <label className="flex items-center gap-2 text-sm text-ink">
        <input name="isPublished" type="checkbox" value="true" defaultChecked={Boolean(value?.isPublished)} className="h-4 w-4" />
        发布课程
      </label>
      <label>
        <RequiredLabel required={false}>课程说明</RequiredLabel>
        <textarea name="description" defaultValue={value?.description || ""} rows={3} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
      </label>
      <button type="submit" className="h-10 rounded-md bg-brand-600 text-sm font-semibold text-white">
        保存课程
      </button>
    </form>
  );
}

export function ChapterCreateForm({ courseId, canManage }: { courseId: string; canManage: boolean }) {
  const router = useRouter();
  async function submit(formData: FormData) {
    formData.set("action", "chapter:create");
    const response = await fetch(`/api/courses/${courseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "章节保存失败");
      return;
    }
    router.refresh();
  }

  if (!canManage) return null;
  return (
    <form action={submit} className="grid gap-3 rounded-lg border border-line bg-white p-4">
      <div className="font-semibold text-ink">新增章节</div>
      <Input name="title" label="章节标题" required />
      <Input name="sortOrder" label="排序" type="number" defaultValue="0" />
      <label>
        <RequiredLabel required={false}>章节说明</RequiredLabel>
        <textarea name="description" rows={2} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
      </label>
      <button type="submit" className="h-10 rounded-md bg-brand-600 text-sm font-semibold text-white">保存章节</button>
    </form>
  );
}

export function ChapterEditForm({ courseId, chapter, canManage }: { courseId: string; chapter: ChapterValue; canManage: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function submit(formData: FormData) {
    formData.set("action", "chapter:update");
    formData.set("chapterId", chapter.id);
    const response = await fetch(`/api/courses/${courseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "章节保存失败");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!canManage) return null;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs text-ink">
        <Pencil className="h-3.5 w-3.5" />
        编辑
      </button>
    );
  }
  return (
    <form action={submit} className="mt-3 grid gap-3 rounded-md border border-line bg-[#F8FAFB] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-ink">编辑章节</div>
        <button type="button" onClick={() => setOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      <Input name="title" label="章节标题" required defaultValue={chapter.title} />
      <Input name="sortOrder" label="排序" type="number" required defaultValue={String(chapter.sortOrder)} />
      <label>
        <RequiredLabel required={false}>章节说明</RequiredLabel>
        <textarea name="description" defaultValue={chapter.description || ""} rows={2} className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2 text-sm" />
      </label>
      <button type="submit" className="h-9 rounded-md bg-brand-600 text-sm font-semibold text-white">保存章节</button>
    </form>
  );
}

export function LessonCreateForm({
  courseId,
  chapters,
  contents,
  papers,
  canManage
}: {
  courseId: string;
  chapters: Option[];
  contents: Option[];
  papers: Option[];
  canManage: boolean;
}) {
  const router = useRouter();
  async function submit(formData: FormData) {
    formData.set("action", "lesson:create");
    const response = await fetch(`/api/courses/${courseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "课时保存失败");
      return;
    }
    router.refresh();
  }

  if (!canManage) return null;
  return (
    <form action={submit} className="grid gap-3 rounded-lg border border-line bg-white p-4">
      <div className="font-semibold text-ink">新增课时</div>
      <Select name="chapterId" label="所属章节" required options={chapters} />
      <Input name="title" label="课时标题" required />
      <Input name="durationMinutes" label="时长（分钟）" type="number" defaultValue="0" />
      <Input name="sortOrder" label="排序" type="number" defaultValue="0" />
      <Select name="teachingContentId" label="关联教研内容" options={[{ id: "", name: "不关联" }, ...contents]} />
      <Select name="questionPaperId" label="关联试卷" options={[{ id: "", name: "不关联" }, ...papers]} />
      <label>
        <RequiredLabel required={false}>课时摘要</RequiredLabel>
        <textarea name="summary" rows={2} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
      </label>
      <button type="submit" className="h-10 rounded-md bg-brand-600 text-sm font-semibold text-white">保存课时</button>
    </form>
  );
}

export function LessonEditForm({
  courseId,
  lesson,
  contents,
  papers,
  canManage
}: {
  courseId: string;
  lesson: LessonValue;
  contents: Option[];
  papers: Option[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  async function submit(formData: FormData) {
    formData.set("action", "lesson:update");
    formData.set("lessonId", lesson.id);
    const response = await fetch(`/api/courses/${courseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "课时保存失败");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!canManage) return null;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs text-ink">
        <Pencil className="h-3.5 w-3.5" />
        编辑
      </button>
    );
  }
  return (
    <form action={submit} className="grid min-w-64 gap-3 rounded-md border border-line bg-[#F8FAFB] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-ink">编辑课时</div>
        <button type="button" onClick={() => setOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      <Input name="title" label="课时标题" required defaultValue={lesson.title} />
      <Input name="durationMinutes" label="时长（分钟）" type="number" required defaultValue={String(lesson.durationMinutes)} />
      <Input name="sortOrder" label="排序" type="number" required defaultValue={String(lesson.sortOrder)} />
      <Select name="teachingContentId" label="关联教研内容" options={[{ id: "", name: "不关联" }, ...contents]} defaultValue={lesson.teachingContentId || ""} />
      <Select name="questionPaperId" label="关联试卷" options={[{ id: "", name: "不关联" }, ...papers]} defaultValue={lesson.questionPaperId || ""} />
      <label>
        <RequiredLabel required={false}>课时摘要</RequiredLabel>
        <textarea name="summary" defaultValue={lesson.summary || ""} rows={2} className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2 text-sm" />
      </label>
      <button type="submit" className="h-9 rounded-md bg-brand-600 text-sm font-semibold text-white">保存课时</button>
    </form>
  );
}

function Input({ name, label, type = "text", required, defaultValue }: { name: string; label: string; type?: string; required?: boolean; defaultValue?: string }) {
  return (
    <label>
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <input name={name} type={type} required={required} defaultValue={defaultValue || ""} className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm" />
    </label>
  );
}

function Select({ name, label, options, defaultValue, required }: { name: string; label: string; options: Option[]; defaultValue?: string; required?: boolean }) {
  return (
    <label>
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <select name={name} required={required} defaultValue={defaultValue} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm">
        {options.map((item) => (
          <option key={`${name}-${item.id || "empty"}`} value={item.id}>{item.name}</option>
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
        {options.map((item) => (
          <option key={`${name}-${item.value}`} value={item.value}>{item.label}</option>
        ))}
      </select>
    </label>
  );
}
