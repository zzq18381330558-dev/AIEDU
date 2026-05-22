"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, MessageSquareText } from "lucide-react";

export function AiStudentActions({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [result, setResult] = useState("");

  async function run(path: "ai-plan" | "service-script") {
    setResult("生成中...");
    const response = await fetch(`/api/student-service/students/${studentId}/${path}`, {
      method: "POST"
    });
    const data = await response.json();
    if (!response.ok) {
      setResult(data.error || "生成失败");
      return;
    }
    setResult(data.item.planText || data.item.serviceScript || "已生成");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => run("ai-plan")}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs text-ink hover:border-brand-500 hover:text-brand-700"
        >
          <Bot className="h-3.5 w-3.5" />
          AI 学习计划
        </button>
        <button
          onClick={() => run("service-script")}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs text-ink hover:border-brand-500 hover:text-brand-700"
        >
          <MessageSquareText className="h-3.5 w-3.5" />
          AI 服务话术
        </button>
      </div>
      {result ? (
        <pre className="max-w-xl whitespace-pre-wrap rounded-md bg-[#F8FAFB] p-3 text-xs leading-5 text-muted">
          {result}
        </pre>
      ) : null}
    </div>
  );
}
