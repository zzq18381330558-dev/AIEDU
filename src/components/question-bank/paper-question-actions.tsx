"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { QuestionModal, type QuestionValue } from "@/components/question-bank/question-modal";

export function PaperQuestionActions({
  paperId,
  defaultSubject,
  defaultQuestion,
  mode = "row"
}: {
  paperId: string;
  defaultSubject?: string;
  defaultQuestion?: QuestionValue | null;
  mode?: "row" | "new";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function remove() {
    if (!defaultQuestion?.id) return;
    if (!confirm("确定从试卷中移除该题？题目不会从题库删除。")) return;
    const response = await fetch(`/api/question-bank/papers/${paperId}/questions/${defaultQuestion.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "移除失败");
      return;
    }
    router.refresh();
  }

  return (
    <>
      {mode === "new" ? (
        <button onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" />
          新增题目
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setOpen(true)} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
            <Pencil className="h-3.5 w-3.5" />
            编辑
          </button>
          <button onClick={remove} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs text-coral">
            <Trash2 className="h-3.5 w-3.5" />
            移除
          </button>
        </div>
      )}
      <QuestionModal
        open={open}
        value={defaultQuestion || null}
        defaultPaperId={paperId}
        defaultSubject={defaultSubject}
        onClose={() => setOpen(false)}
        onSaved={() => {
          router.refresh();
          setOpen(false);
        }}
      />
    </>
  );
}
