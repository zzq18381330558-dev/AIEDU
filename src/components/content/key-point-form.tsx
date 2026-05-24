"use client";

import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { RequiredLabel } from "@/components/ui/required-label";

export function KeyPointForm() {
  const router = useRouter();

  async function submit(formData: FormData) {
    const response = await fetch("/api/content/key-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "考点保存失败");
      return;
    }
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="科目" name="subject" placeholder="综合素质" required />
        <Field label="章节" name="chapter" placeholder="职业理念" required />
        <Field label="考点名称" name="name" placeholder="职业理念" required />
        <label>
          <RequiredLabel required={false}>高频指数</RequiredLabel>
          <select name="frequency" defaultValue="5" className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm">
            {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <Field label="常考题型" name="questionTypes" placeholder="单选题、材料分析题" required />
        <Field label="关键词" name="keywords" placeholder="学生观、教师观、素质教育" required />
      </div>
      <label>
        <RequiredLabel>命题方向</RequiredLabel>
        <textarea name="direction" required rows={3} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" placeholder="围绕教育观、学生观、教师观考查概念理解和材料分析。" />
      </label>
      <label>
        <RequiredLabel>易错点</RequiredLabel>
        <textarea name="mistakes" required rows={3} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" placeholder="容易把学生是发展中的人与学生是完整的人混淆。" />
      </label>
      <label>
        <span className="text-sm font-medium text-ink">备注</span>
        <textarea name="note" rows={2} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
      </label>
      <button type="submit" className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white">
        <Save className="h-4 w-4" />
        保存考点
      </button>
    </form>
  );
}

function Field({ label, name, placeholder, required = false }: { label: string; name: string; placeholder?: string; required?: boolean }) {
  return (
    <label>
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <input name={name} placeholder={placeholder} required={required} className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm" />
    </label>
  );
}
