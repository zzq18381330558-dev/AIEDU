import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildPaperStrategy, canManageQuestionBank, normalizePaperInput } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;

  const items = await prisma.examPaper.findMany({
    include: {
      _count: { select: { questions: true, paperQuestions: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;
  if (!canManageQuestionBank(auth.user.role)) return NextResponse.json({ error: "无权管理试卷" }, { status: 403 });

  try {
    const body = await request.json();
    if (body.mode !== "auto-generate") {
      const item = await prisma.examPaper.create({
        data: normalizePaperInput(body),
        include: {
          _count: { select: { questions: true, paperQuestions: true } }
        }
      });
      return NextResponse.json({ item }, { status: 201 });
    }

    const strategy = buildPaperStrategy(body);
    const where: Prisma.QuestionWhereInput = {
      subject: strategy.subject,
      difficulty: { gte: strategy.difficultyFrom, lte: strategy.difficultyTo }
    };
    if (strategy.type) where.type = strategy.type;
    if (strategy.chapter) where.chapter = { contains: strategy.chapter, mode: "insensitive" };
    if (strategy.knowledgePoint) where.knowledgePoint = { contains: strategy.knowledgePoint, mode: "insensitive" };
    if (strategy.tags.length) where.highFrequencyTags = { hasSome: strategy.tags };

    const questions = await prisma.question.findMany({
      where,
      orderBy: [{ difficulty: "asc" }, { updatedAt: "desc" }],
      take: strategy.count
    });
    if (questions.length === 0) throw new Error("没有符合条件的题目，请放宽科目、知识点、题型或难度筛选后重试");

    const item = await prisma.examPaper.create({
      data: {
        title: String(body.title || `${new Date().toLocaleDateString("zh-CN")} 自动组卷`),
        paperType: "SPECIAL",
        subject: strategy.subject,
        totalScore: Number(body.totalScore || questions.length * 2),
        durationMinutes: Number(body.durationMinutes || 120),
        questionCount: questions.length,
        strategy,
        questions: {
          create: questions.map((question, index) => ({
            questionId: question.id,
            sortOrder: index + 1,
            score: Number(body.score || 2)
          }))
        }
      },
      include: {
        questions: {
          include: { question: true },
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
