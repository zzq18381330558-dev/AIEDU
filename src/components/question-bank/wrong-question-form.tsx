"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NotebookPen } from "lucide-react";
import { RequiredLabel } from "@/components/ui/required-label";

type StudentOption = {
  id: string;
  name: string;
  school: string | null;
};

export function WrongQuestionForm({
  questionId,
  students
}: {
  questionId: string;
  students: StudentOption[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/question-bank/wrong-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, questionId, mastered: payload.mastered === "on" })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "错题记录保存失败");
      return;
    }
    setMessage("错题记录已保存");
    router.refresh();
  }

  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <div className="mb-4 flex items-center gap-2 font-semibold text-ink">
        <NotebookPen className="h-4 w-4 text-brand-600" />
        记录错题
      </div>
      {students.length === 0 ? (
        <div className="rounded-md bg-[#F8FAFB] p-4 text-sm text-muted">暂无可选择学员，请先确认已有学员数据后再记录错题。</div>
      ) : (
        <form action={submit} className="grid gap-3">
          <label>
            <RequiredLabel>学员</RequiredLabel>
            <select name="studentId" required className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm">
              <option value="">请选择学员</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}{student.school ? ` · ${student.school}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-sm font-medium text-ink">学员作答</span>
            <input name="answer" className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm" />
          </label>
          <label>
            <span className="text-sm font-medium text-ink">错因</span>
            <textarea name="reason" rows={3} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input name="mastered" type="checkbox" className="h-4 w-4 rounded border-line" />
            已完成订正并掌握
          </label>
          {message ? <div className="text-sm text-muted">{message}</div> : null}
          <button type="submit" className="h-10 rounded-md bg-brand-600 text-sm font-semibold text-white">保存错题</button>
        </form>
      )}
    </section>
  );
}
