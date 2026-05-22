import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api";
import { buildAiAnalysis, canManageQuestionBank } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;
  if (!canManageQuestionBank(auth.user.role)) return NextResponse.json({ error: "无权生成解析" }, { status: 403 });

  const { id } = await context.params;
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) return NextResponse.json({ error: "题目不存在" }, { status: 404 });

  const analysis = buildAiAnalysis(question);
  const item = await prisma.question.update({
    where: { id },
    data: { analysis },
    include: {
      bank: { select: { id: true, name: true } },
      _count: { select: { wrongRecords: true, paperItems: true } }
    }
  });
  return NextResponse.json({ item });
}
