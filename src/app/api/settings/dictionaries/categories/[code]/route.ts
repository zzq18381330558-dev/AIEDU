import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const defaultCategoryCodes = new Set([
  "SCHOOL",
  "MAJOR",
  "EXAM_TRACK",
  "LEAD_SOURCE",
  "QUESTION_TYPE",
  "DIFFICULTY",
  "CLASS_TYPE"
]);

function deleteResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message, error: message }, { status });
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ code: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  if (auth.user.role !== "ADMIN") return deleteResponse("仅管理员可以删除分类", 403);

  const { code: encodedCode } = await context.params;
  const code = decodeURIComponent(encodedCode);
  if (defaultCategoryCodes.has(code)) return deleteResponse("默认分类不可删除", 400);

  try {
    const category = await prisma.businessDictionaryCategory.findUnique({
      where: { code },
      select: { id: true, code: true, isSystem: true }
    });
    if (!category) return deleteResponse("分类不存在", 404);
    if (category.isSystem) return deleteResponse("默认分类不可删除", 400);

    const dictionaryCount = await prisma.$queryRaw<Array<{ count: number | bigint }>>`
      SELECT COUNT(*)::int AS count
      FROM "BusinessDictionary"
      WHERE category::text = ${code}
    `;
    if (Number(dictionaryCount[0]?.count || 0) > 0) {
      return deleteResponse("该分类下仍存在字典项，无法删除", 400);
    }

    await prisma.businessDictionaryCategory.delete({ where: { code } });
    return NextResponse.json({ success: true, message: "分类已删除" });
  } catch (error) {
    if (error instanceof Error && /Foreign key constraint|P2003/i.test(error.message)) {
      return deleteResponse("该分类正在被业务使用，无法删除", 400);
    }
    return deleteResponse("删除分类失败，请稍后重试", 500);
  }
}
