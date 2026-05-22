import { NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildAiStudyPlan, studentScopeWhere } from "@/lib/student-service";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiUser("/student-service");
    if ("response" in auth) return auth.response;
    const { id } = await context.params;

    const student = await prisma.student.findFirst({
      where: { id, ...studentScopeWhere(auth.user) }
    });
    if (!student) return NextResponse.json({ error: "学员不存在" }, { status: 404 });

    const planText = buildAiStudyPlan(student);
    const item = await prisma.studyPlan.create({
      data: {
        studentId: student.id,
        title: `${student.name} 教资备考 AI 学习计划`,
        aiSummary: "基于学员档案自动生成的阶段学习安排",
        planText,
        progress: 0
      }
    });
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error, 500);
  }
}
