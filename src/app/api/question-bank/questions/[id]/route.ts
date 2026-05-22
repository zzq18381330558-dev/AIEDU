import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { canManageQuestionBank, normalizeQuestionInput } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";

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
      include: {
        bank: { select: { id: true, name: true } },
        _count: { select: { wrongRecords: true, paperItems: true } }
      }
    });
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}
