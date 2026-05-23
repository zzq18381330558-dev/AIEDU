import { NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { canManageQuestionBank } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; questionId: string }> }
) {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;
  if (!canManageQuestionBank(auth.user.role)) return NextResponse.json({ error: "无权移除试卷题目" }, { status: 403 });

  try {
    const { id, questionId } = await context.params;
    await prisma.$transaction(async (tx) => {
      const question = await tx.question.findFirst({ where: { id: questionId, paperId: id }, select: { id: true } });
      if (!question) throw new Error("题目不在当前试卷中");
      await tx.question.update({
        where: { id: questionId },
        data: { paperId: null, questionNo: null, score: null }
      });
      const questionCount = await tx.question.count({ where: { paperId: id } });
      await tx.examPaper.update({ where: { id }, data: { questionCount } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
