import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import { canManageQuestionBank, normalizePaperInput } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";

const include = {
  paperQuestions: {
    orderBy: [{ questionNo: "asc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { wrongRecords: true, paperItems: true } }
    }
  },
  questions: {
    include: { question: true },
    orderBy: { sortOrder: "asc" }
  },
  _count: { select: { paperQuestions: true, questions: true } }
} satisfies Prisma.ExamPaperInclude;

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const item = await prisma.examPaper.findUnique({ where: { id }, include });
  if (!item) return NextResponse.json({ error: "试卷不存在或已被删除" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;
  if (!canManageQuestionBank(auth.user.role)) return NextResponse.json({ error: "无权编辑试卷" }, { status: 403 });

  try {
    const { id } = await context.params;
    const body = await request.json();
    const currentCount = await prisma.question.count({ where: { paperId: id } });
    const item = await prisma.examPaper.update({
      where: { id },
      data: { ...normalizePaperInput(body), questionCount: currentCount },
      include
    });
    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "试卷不存在或已被删除" }, { status: 404 });
    }
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;
  if (!canManageQuestionBank(auth.user.role)) return NextResponse.json({ error: "无权删除试卷" }, { status: 403 });

  try {
    const { id } = await context.params;
    await prisma.$transaction([
      prisma.question.updateMany({
        where: { paperId: id },
        data: { paperId: null, questionNo: null, score: null }
      }),
      prisma.examPaper.delete({ where: { id } })
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "试卷不存在或已被删除" }, { status: 404 });
    }
    return jsonError(error);
  }
}
