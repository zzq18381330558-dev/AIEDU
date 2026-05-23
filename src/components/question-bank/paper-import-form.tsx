"use client";

import { useRouter } from "next/navigation";
import { FileUp } from "lucide-react";
import { paperQuestionImportHeaders, paperQuestionImportRequiredHeaders } from "@/lib/question-bank";

export function PaperImportForm({ paperId }: { paperId: string }) {
  const router = useRouter();

  async function submit(formData: FormData) {
    const response = await fetch(`/api/question-bank/papers/${paperId}/import`, { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) {
      const detail = data.errors?.length ? `\n${data.errors.map((item: { row: number; message: string }) => `第 ${item.row} 行：${item.message}`).join("\n")}` : "";
      alert(`${data.error || "成套导入失败"}${detail}`);
      return;
    }
    alert(`成套导入完成：成功 ${data.success} 题，当前题量 ${data.questionCount}`);
    router.refresh();
  }

  return (
    <section className="rounded-lg border border-line bg-white p-4">
      <div className="mb-3 flex items-center gap-2 font-semibold text-ink">
        <FileUp className="h-4 w-4 text-brand-600" />
        成套导入
      </div>
      <form action={submit} className="grid gap-3">
        <p className="text-xs leading-5 text-muted">
          必填列：{paperQuestionImportRequiredHeaders.join("、")}。建议表头：{paperQuestionImportHeaders.join("、")}。
        </p>
        <input name="file" type="file" accept=".xlsx,.xls,.csv" required className="text-sm" />
        <button type="submit" className="h-10 rounded-md border border-line px-3 text-sm">上传 Excel</button>
      </form>
    </section>
  );
}
