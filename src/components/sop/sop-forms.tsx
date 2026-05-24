"use client";

import { useRouter } from "next/navigation";
import { ClipboardCheck, FilePlus2, Flag, ListChecks, NotebookPen, PencilLine, ShieldCheck } from "lucide-react";
import { sopCategoryOptions, sopStatusOptions, sopTaskStatusOptions } from "@/lib/sop";
import { RequiredLabel } from "@/components/ui/required-label";

type Option = { id: string; name: string };

export function SopTemplateForm() {
  const router = useRouter();
  async function submit(formData: FormData) {
    const response = await fetch("/api/sop/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "新建失败");
      return;
    }
    router.push(`/sop/${data.item.id}`);
  }

  return (
    <form action={submit} className="rounded-lg border border-line bg-white p-4">
      <FormTitle icon={FilePlus2} title="新建 SOP 文档" />
      <Field name="title" label="运营SOP 标题" required placeholder="如：招生地推标准动作 SOP" />
      <Select name="category" label="分类" options={sopCategoryOptions.map((item) => ({ value: item.value, label: item.label }))} />
      <Select name="status" label="状态" options={sopStatusOptions.map((item) => ({ value: item.value, label: item.label }))} />
      <Field name="module" label="模块" placeholder="如：招生 SOP / 教务 SOP" />
      <TextArea name="summary" label="摘要" rows={3} />
      <TextArea name="document" label="标准文档" rows={6} />
      <TextArea
        name="steps"
        label="标准步骤"
        rows={6}
        placeholder={"每行一个步骤，可用“步骤标题 | 验收标准”格式\n例：确认地推点位 | 点位、时间、负责人清晰"}
      />
      <button className="mt-4 h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white">新建运营SOP</button>
    </form>
  );
}

export function SopExecutionForm({
  templateId,
  campuses
}: {
  templateId: string;
  campuses: Option[];
}) {
  const router = useRouter();
  async function submit(formData: FormData) {
    const response = await fetch(`/api/sop/templates/${templateId}/executions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "启动失败");
      return;
    }
    alert(`已为校区生成 ${data.taskCount} 个执行任务`);
    router.refresh();
  }

  return (
    <form action={submit} className="rounded-lg border border-line bg-white p-4">
      <FormTitle icon={Flag} title="启动校区执行" />
      <Select name="campusId" label="执行校区" options={campuses.map((item) => ({ value: item.id, label: item.name }))} />
      <Field name="owner" label="校区责任人" required placeholder="如：校区校长 / 张老师" />
      <button className="mt-4 h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white">生成任务清单</button>
    </form>
  );
}

export function SopTaskForm({
  templateId,
  campuses,
  executions
}: {
  templateId: string;
  campuses: Option[];
  executions: Array<{ id: string; campus: Option; owner: string }>;
}) {
  const router = useRouter();
  async function submit(formData: FormData) {
    const response = await fetch(`/api/sop/templates/${templateId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "新建失败");
      return;
    }
    alert("任务已新建");
    router.refresh();
  }

  return (
    <form action={submit} className="rounded-lg border border-line bg-white p-4">
      <FormTitle icon={ListChecks} title="新建每日任务" />
      <Field name="title" label="任务标题" required />
      <Select name="campusId" label="校区" options={campuses.map((item) => ({ value: item.id, label: item.name }))} />
      <Select
        name="sopExecutionId"
        label="关联执行"
        options={[
          { value: "", label: "不关联执行批次" },
          ...executions.map((item) => ({ value: item.id, label: `${item.campus.name} · ${item.owner}` }))
        ]}
      />
      <Field name="dueDate" label="截止时间" type="datetime-local" />
      <TextArea name="description" label="任务说明" rows={3} />
      <button className="mt-4 h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white">新建任务</button>
    </form>
  );
}

export function SopTaskCheckInForm({ taskId }: { taskId: string }) {
  const router = useRouter();
  async function submit(formData: FormData) {
    const response = await fetch(`/api/sop/tasks/${taskId}/check-ins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "打卡失败");
      return;
    }
    router.refresh();
  }

  return (
    <form action={submit} className="mt-3 grid gap-2 rounded-md bg-[#F8FAFB] p-3">
      <Select name="status" label="处理状态" options={sopTaskStatusOptions.map((item) => ({ value: item.value, label: item.label }))} />
      <TextArea name="note" label="打卡说明" rows={2} required />
      <Field name="evidence" label="凭证链接" placeholder="表格、截图或资料链接" />
      <button className="h-9 rounded-md border border-line bg-white text-sm text-ink">提交打卡</button>
    </form>
  );
}

export function SopTaskEditForm({
  task
}: {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    dueDate: string;
  };
}) {
  const router = useRouter();
  async function submit(formData: FormData) {
    const response = await fetch(`/api/sop/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "任务保存失败");
      return;
    }
    alert("任务已保存");
    router.refresh();
  }

  return (
    <details className="mt-3 rounded-md bg-[#F8FAFB] p-3">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
        <PencilLine className="h-4 w-4 text-brand-600" />
        编辑任务
      </summary>
      <form action={submit} className="mt-2 grid gap-2">
        <Field name="title" label="任务标题" required defaultValue={task.title} />
        <Select
          name="status"
          label="处理状态"
          defaultValue={task.status}
          options={sopTaskStatusOptions.map((item) => ({ value: item.value, label: item.label }))}
        />
        <Field name="dueDate" label="截止时间" type="datetime-local" defaultValue={task.dueDate} />
        <TextArea name="description" label="任务说明" rows={3} defaultValue={task.description || ""} />
        <button className="h-9 rounded-md border border-line bg-white text-sm text-ink">保存任务</button>
      </form>
    </details>
  );
}

export function SopInspectionForm({
  templateId,
  executions
}: {
  templateId: string;
  executions: Array<{ id: string; campus: Option; owner: string }>;
}) {
  const router = useRouter();
  async function submit(formData: FormData) {
    const response = await fetch(`/api/sop/templates/${templateId}/inspections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "提交失败");
      return;
    }
    alert("总部检查已保存");
    router.refresh();
  }

  return (
    <form action={submit} className="rounded-lg border border-line bg-white p-4">
      <FormTitle icon={ShieldCheck} title="总部检查评分" />
      <Select
        name="sopExecutionId"
        label="检查对象"
        options={[
          { value: "", label: "仅检查 SOP 文档" },
          ...executions.map((item) => ({ value: item.id, label: `${item.campus.name} · ${item.owner}` }))
        ]}
      />
      <Field name="score" label="评分" type="number" defaultValue="80" />
      <CheckBox name="documentReady" label="文档标准清晰" />
      <CheckBox name="taskTraceable" label="任务过程可追踪" />
      <CheckBox name="dataReviewed" label="数据完成复盘" />
      <CheckBox name="campusFeedback" label="校区反馈已处理" />
      <TextArea name="comment" label="检查意见" rows={4} />
      <button className="mt-4 h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white">保存评分</button>
    </form>
  );
}

export function SopWeeklyReportForm({
  templateId,
  campuses,
  executions
}: {
  templateId: string;
  campuses: Option[];
  executions: Array<{ id: string; campus: Option; owner: string }>;
}) {
  const router = useRouter();
  async function submit(formData: FormData) {
    const response = await fetch(`/api/sop/templates/${templateId}/weekly-reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "提交失败");
      return;
    }
    alert("周报已提交");
    router.refresh();
  }

  return (
    <form action={submit} className="rounded-lg border border-line bg-white p-4">
      <FormTitle icon={NotebookPen} title="提交校区周报" />
      <Select name="campusId" label="校区" options={campuses.map((item) => ({ value: item.id, label: item.name }))} />
      <Select
        name="sopExecutionId"
        label="关联执行"
        options={[
          { value: "", label: "不关联执行批次" },
          ...executions.map((item) => ({ value: item.id, label: `${item.campus.name} · ${item.owner}` }))
        ]}
      />
      <Field name="weekStart" label="周起始日" type="date" />
      <TextArea name="summary" label="本周总结" rows={4} required />
      <TextArea name="blockers" label="阻塞问题" rows={3} />
      <TextArea name="nextPlan" label="下周计划" rows={3} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="leadCount" label="新建线索" type="number" defaultValue="0" />
        <Field name="consultCount" label="有效咨询" type="number" defaultValue="0" />
        <Field name="classCount" label="开班/课程" type="number" defaultValue="0" />
        <Field name="riskCount" label="风险事项" type="number" defaultValue="0" />
      </div>
      <button className="mt-4 h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white">提交周报</button>
    </form>
  );
}

function FormTitle({ icon: Icon, title }: { icon: typeof ClipboardCheck; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 font-semibold text-ink">
      <Icon className="h-4 w-4 text-brand-600" />
      {title}
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
  defaultValue
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="mt-3 block">
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-brand-500"
      />
    </label>
  );
}

function Select({
  name,
  label,
  options,
  defaultValue
}: {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
}) {
  return (
    <label className="mt-3 block">
      <RequiredLabel required={false}>{label}</RequiredLabel>
      <select name={name} defaultValue={defaultValue} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm">
        {options.map((item) => (
          <option key={`${name}-${item.value}`} value={item.value}>{item.label}</option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  name,
  label,
  rows,
  required,
  placeholder,
  defaultValue
}: {
  name: string;
  label: string;
  rows: number;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="mt-3 block">
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-500"
      />
    </label>
  );
}

function CheckBox({ name, label }: { name: string; label: string }) {
  return (
    <label className="mt-3 flex items-center gap-2 text-sm text-ink">
      <input name={name} type="checkbox" value="true" className="h-4 w-4 rounded border-line" />
      {label}
    </label>
  );
}
