"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function PaperDeleteButton({ paperId }: { paperId: string }) {
  const router = useRouter();

  async function remove() {
    if (!confirm("确定删除试卷？题目不会被删除，只会解除试卷关联。")) return;
    const response = await fetch(`/api/question-bank/papers/${paperId}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "删除试卷失败");
      return;
    }
    router.refresh();
  }

  return (
    <button onClick={remove} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs text-coral">
      <Trash2 className="h-3.5 w-3.5" />
      删除
    </button>
  );
}
