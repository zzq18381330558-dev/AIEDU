import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api";
import { buildServiceScript, studentScopeWhere } from "@/lib/student-service";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  const student = await prisma.student.findFirst({
    where: { id, ...studentScopeWhere(auth.user) }
  });
  if (!student) return NextResponse.json({ error: "学员不存在" }, { status: 404 });

  const serviceScript = buildServiceScript(student);
  const item = await prisma.studyPlan.create({
    data: {
      studentId: student.id,
      title: `${student.name} 学员服务话术`,
      aiSummary: "基于学员状态自动生成的教务沟通话术",
      serviceScript,
      progress: 0
    }
  });
  return NextResponse.json({ item });
}
