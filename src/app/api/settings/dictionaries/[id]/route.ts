import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  findBusinessDictionaryDuplicate,
  updateBusinessDictionary
} from "@/lib/settings-dictionary-db";
import { normalizeDictionaryInput } from "@/lib/settings";

const defaultDictionaryKeys = new Set([
  "SCHOOL::上海师范大学",
  "SCHOOL::华东师范大学",
  "MAJOR::汉语言文学",
  "MAJOR::小学教育",
  "EXAM_TRACK::幼儿",
  "EXAM_TRACK::小学",
  "EXAM_TRACK::中学",
  "LEAD_SOURCE::高校合作",
  "LEAD_SOURCE::地推",
  "QUESTION_TYPE::单选题",
  "QUESTION_TYPE::材料分析题",
  "DIFFICULTY::基础",
  "DIFFICULTY::中等",
  "CLASS_TYPE::周末班",
  "CLASS_TYPE::冲刺班"
]);

type DictionaryForDelete = {
  id: string;
  category: string;
  name: string;
  value: string | null;
};

function deleteResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message, error: message }, { status });
}

function dictionaryValues(item: DictionaryForDelete) {
  return Array.from(new Set([item.name, item.value].filter((value): value is string => Boolean(value))));
}

async function rawCount(query: Prisma.Sql) {
  const rows = await prisma.$queryRaw<Array<{ count: number | bigint }>>(query);
  return Number(rows[0]?.count || 0);
}

function numericDictionaryValue(item: DictionaryForDelete) {
  const value = Number.parseInt(item.value || item.name, 10);
  return Number.isFinite(value) ? value : null;
}

async function getDictionaryUsageCount(item: DictionaryForDelete) {
  const values = dictionaryValues(item);
  if (values.length === 0) return 0;
  const valueList = Prisma.join(values);

  switch (item.category) {
    case "SCHOOL":
      return rawCount(Prisma.sql`
        SELECT COUNT(*)::int AS count
        FROM (
          SELECT id FROM "Lead" WHERE school IN (${valueList})
          UNION ALL
          SELECT id FROM "Student" WHERE school IN (${valueList})
        ) used
      `);
    case "MAJOR":
      return rawCount(Prisma.sql`
        SELECT COUNT(*)::int AS count
        FROM (
          SELECT id FROM "Lead" WHERE major IN (${valueList})
          UNION ALL
          SELECT id FROM "Student" WHERE major IN (${valueList})
        ) used
      `);
    case "CLASS_TYPE":
      return rawCount(Prisma.sql`
        SELECT COUNT(*)::int AS count
        FROM (
          SELECT id FROM "Student" WHERE "classType" IN (${valueList})
          UNION ALL
          SELECT id FROM "StudentClass" WHERE "classType" IN (${valueList})
        ) used
      `);
    case "EXAM_TRACK":
      return rawCount(Prisma.sql`
        SELECT COUNT(*)::int AS count
        FROM (
          SELECT id FROM "Lead" WHERE "examTrack"::text IN (${valueList})
          UNION ALL
          SELECT id FROM "Student" WHERE "examTrack"::text IN (${valueList})
          UNION ALL
          SELECT id FROM "StudentClass" WHERE "examTrack"::text IN (${valueList})
          UNION ALL
          SELECT id FROM "QuestionBank" WHERE "examTrack"::text IN (${valueList})
        ) used
      `);
    case "LEAD_SOURCE":
      return rawCount(Prisma.sql`
        SELECT COUNT(*)::int AS count
        FROM "Lead"
        WHERE "sourceChannel"::text IN (${valueList})
      `);
    case "QUESTION_TYPE":
      return rawCount(Prisma.sql`
        SELECT COUNT(*)::int AS count
        FROM (
          SELECT id FROM "Question" WHERE type::text IN (${valueList})
          UNION ALL
          SELECT id FROM "TeachingKeyPoint" WHERE ${Prisma.join(values.map((value) => Prisma.sql`"questionTypes" ILIKE ${`%${value}%`}`), " OR ")}
        ) used
      `);
    case "DIFFICULTY": {
      const difficulty = numericDictionaryValue(item);
      if (difficulty === null) return 0;
      return rawCount(Prisma.sql`
        SELECT COUNT(*)::int AS count
        FROM "Question"
        WHERE difficulty = ${difficulty}
      `);
    }
    default:
      return 0;
  }
}

async function getDictionaryDeleteBlockReason(item: DictionaryForDelete) {
  if (defaultDictionaryKeys.has(`${item.category}::${item.name}`)) return "默认字典不可删除";
  const usageCount = await getDictionaryUsageCount(item);
  if (usageCount > 0) return "该字典项正在被业务数据使用，无法删除";
  return null;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "仅管理员可以管理字典" }, { status: 403 });
  const { id } = await context.params;

  try {
    const exists = await prisma.businessDictionary.findFirst({
      where: { id, organizationId: auth.user.organizationId },
      select: { id: true }
    });
    if (!exists) return NextResponse.json({ error: "字典项不存在" }, { status: 404 });

    const body = await request.json();
    const data = normalizeDictionaryInput(body, { organizationId: auth.user.organizationId });
    const duplicate = await findBusinessDictionaryDuplicate(data, id);
    if (duplicate) return NextResponse.json({ error: "同一分类下已存在相同字典名称" }, { status: 400 });

    const item = await updateBusinessDictionary(id, data);
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  if (auth.user.role !== "ADMIN") return deleteResponse("仅管理员可以删除字典", 403);
  const { id } = await context.params;

  try {
    const rows = await prisma.$queryRaw<DictionaryForDelete[]>`
      SELECT id, category::text AS category, name, value
      FROM "BusinessDictionary"
      WHERE id = ${id} AND "organizationId" = ${auth.user.organizationId}
      LIMIT 1
    `;
    const item = rows[0];
    if (!item) return deleteResponse("字典项不存在", 404);

    const blockReason = await getDictionaryDeleteBlockReason(item);
    if (blockReason) return deleteResponse(blockReason, 400);

    await prisma.businessDictionary.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "字典项已删除" });
  } catch (error) {
    if (error instanceof Error && /Foreign key constraint|P2003/i.test(error.message)) {
      return deleteResponse("该字典项正在被业务数据使用，无法删除", 400);
    }
    return deleteResponse("删除字典项失败，请稍后重试", 500);
  }
}
