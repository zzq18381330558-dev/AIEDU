import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import { canManageQuestionBank, normalizeQuestionInput } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";

const include = {
  bank: { select: { id: true, name: true } },
  _count: { select: { wrongRecords: true, paperItems: true } }
} satisfies Prisma.QuestionInclude;

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const item = await prisma.question.findUnique({ where: { id }, include });
  if (!item) return NextResponse.json({ error: "题目不存在或已被删除" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;
  if (!canManageQuestionBank(auth.user.role)) return NextResponse.json({ error: "无权编辑题目" }, { status: 403 });

  try {
    const { id } = await context.params;
    const body = await request.json();
    const item = await prisma.question.update({
      where: { id },
      data: normalizeQuestionInput(body),
      include
    });
    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "题目不存在或已被删除" }, { status: 404 });
    }
    return jsonError(error);
  }
}
