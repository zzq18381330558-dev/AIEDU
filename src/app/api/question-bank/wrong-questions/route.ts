import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;

  const items = await prisma.wrongQuestionRecord.findMany({
    include: {
      student: { select: { id: true, name: true, school: true } },
      question: true
    },
    orderBy: { wrongAt: "desc" },
    take: 100
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const studentId = String(body.studentId || "");
    const questionId = String(body.questionId || "");
    if (!studentId || !questionId) throw new Error("请选择学员和题目");

    const item = await prisma.wrongQuestionRecord.create({
      data: {
        studentId,
        questionId,
        answer: body.answer ? String(body.answer) : null,
        reason: body.reason ? String(body.reason) : null,
        mastered: Boolean(body.mastered)
      }
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
