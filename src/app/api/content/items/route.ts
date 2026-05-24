import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildTemplateDrivenDraft, canManageTeachingContent, normalizeContentInput } from "@/lib/teaching-content";
import { prisma } from "@/lib/prisma";

const include = {
  author: { select: { id: true, name: true, phone: true } },
  _count: { select: { versions: true, reviews: true, publications: true, exports: true } }
} satisfies Prisma.TeachingContentInclude;

export async function GET(request: NextRequest) {
  const auth = await requireApiUser("/content");
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const where: Prisma.TeachingContentWhereInput = {};
  const search = searchParams.get("search")?.trim();
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } }
    ];
  }
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  if (type) where.type = type as Prisma.EnumTeachingContentTypeFilter["equals"];
  if (status) where.status = status as Prisma.EnumContentStatusFilter["equals"];

  const items = await prisma.teachingContent.findMany({
    where,
    include,
    orderBy: { updatedAt: "desc" },
    take: 100
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/content");
  if ("response" in auth) return auth.response;
  if (!canManageTeachingContent(auth.user.role)) return NextResponse.json({ error: "无权新建内容" }, { status: 403 });

  try {
    const body = await request.json();
    const input = normalizeContentInput(body, { authorId: auth.user.id });
    const generateDraft = body.generateDraft === true || body.generateDraft === "true";
    const templateId = typeof body.templateId === "string" ? body.templateId : "";
    const keyPointIds = Array.isArray(body.keyPointIds) ? body.keyPointIds.map(String).filter(Boolean) : [];
    if (generateDraft && !templateId) throw new Error("请选择教研模板后再生成初稿");
    if (generateDraft && keyPointIds.length === 0) throw new Error("请选择高频考点后再生成初稿");

    let generatedBody = input.body;
    let generatedPrompt = input.aiPrompt;
    if (generateDraft) {
      const [template, keyPoints] = await Promise.all([
        prisma.teachingContentTemplate.findFirst({ where: { id: templateId, enabled: true } }),
        prisma.teachingKeyPoint.findMany({ where: { id: { in: keyPointIds } }, orderBy: [{ frequency: "desc" }, { updatedAt: "desc" }] })
      ]);
      if (!template) throw new Error("教研模板不存在或已停用");
      if (keyPoints.length === 0) throw new Error("所选高频考点不存在");
      generatedBody = buildTemplateDrivenDraft({
        title: input.title,
        type: input.type,
        category: input.category,
        subject: template.subject,
        chapter: template.chapter,
        template,
        keyPoints
      });
      generatedPrompt = [
        input.aiPrompt,
        `模板结构：${template.structureMarkdown}`,
        `高频考点：${keyPoints.map((point) => `${point.name}｜命题方向：${point.direction}｜易错点：${point.mistakes}`).join("；")}`
      ].filter(Boolean).join("\n");
    }
    const item = await prisma.$transaction(async (tx) => {
      const content = await tx.teachingContent.create({ data: { ...input, aiPrompt: generatedPrompt, body: generatedBody } });
      await tx.teachingContentVersion.create({
        data: {
          contentId: content.id,
          version: 1,
          title: content.title,
          body: content.body || "",
          changeNote: generateDraft ? "根据模板和高频考点生成初稿" : "新建内容"
        }
      });
      return tx.teachingContent.findUniqueOrThrow({ where: { id: content.id }, include });
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
