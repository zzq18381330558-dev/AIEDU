import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import {
  canManageQuestionBank,
  normalizeQuestionInput,
  questionSourceOptions,
  questionTypeOptions,
  subjectOptions
} from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";

const include = {
  bank: { select: { id: true, name: true } },
  _count: { select: { wrongRecords: true, paperItems: true } }
} satisfies Prisma.QuestionInclude;

function isOptionValue<T extends string>(value: string | null, options: Array<{ value: T }>) {
  return value ? options.some((option) => option.value === value) : false;
}

export async function GET(request: NextRequest) {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const where: Prisma.QuestionWhereInput = {};
  const search = searchParams.get("search")?.trim();
  if (search) {
    where.OR = [
      { stem: { contains: search, mode: "insensitive" } },
      { chapter: { contains: search, mode: "insensitive" } },
      { knowledgePoint: { contains: search, mode: "insensitive" } }
    ];
  }
  const subject = searchParams.get("subject");
  const type = searchParams.get("type");
  const source = searchParams.get("source");
  const chapter = searchParams.get("chapter")?.trim();
  const knowledgePoint = searchParams.get("knowledgePoint")?.trim();
  const tag = searchParams.get("tag")?.trim();
  const difficulty = Number(searchParams.get("difficulty") || "");
  if (subject && !isOptionValue(subject, subjectOptions)) return NextResponse.json({ error: "科目筛选条件无效" }, { status: 400 });
  if (type && !isOptionValue(type, questionTypeOptions)) return NextResponse.json({ error: "题型筛选条件无效" }, { status: 400 });
  if (source && !isOptionValue(source, questionSourceOptions)) return NextResponse.json({ error: "来源筛选条件无效" }, { status: 400 });
  if (searchParams.get("difficulty") && (!Number.isFinite(difficulty) || difficulty < 1 || difficulty > 5)) {
    return NextResponse.json({ error: "难度筛选需为 1-5" }, { status: 400 });
  }
  if (subject) where.subject = subject as Prisma.EnumQuestionSubjectFilter["equals"];
  if (type) where.type = type as Prisma.EnumQuestionTypeFilter["equals"];
  if (source) where.source = source as Prisma.EnumQuestionSourceFilter["equals"];
  if (chapter) where.chapter = { contains: chapter, mode: "insensitive" };
  if (knowledgePoint) where.knowledgePoint = { contains: knowledgePoint, mode: "insensitive" };
  if (tag) where.highFrequencyTags = { has: tag };
  if (Number.isFinite(difficulty) && difficulty >= 1 && difficulty <= 5) where.difficulty = difficulty;

  const [items, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include,
      orderBy: { updatedAt: "desc" },
      take: 100
    }),
    prisma.question.count({ where })
  ]);

  return NextResponse.json({ items, total });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;
  if (!canManageQuestionBank(auth.user.role)) return NextResponse.json({ error: "无权录入题目" }, { status: 403 });

  try {
    const body = await request.json();
    const item = await prisma.question.create({
      data: normalizeQuestionInput(body),
      include
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
