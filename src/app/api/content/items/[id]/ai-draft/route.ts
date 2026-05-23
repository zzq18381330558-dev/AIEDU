import { NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildTemplateDrivenDraft, canManageTeachingContent } from "@/lib/teaching-content";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiUser("/content");
    if ("response" in auth) return auth.response;
    if (!canManageTeachingContent(auth.user.role)) return NextResponse.json({ error: "无权生成内容" }, { status: 403 });

    const { id } = await context.params;
    const requestBody = await request.json().catch(() => ({}));
    const templateId = typeof requestBody.templateId === "string" ? requestBody.templateId : "";
    const keyPointIds = Array.isArray(requestBody.keyPointIds) ? requestBody.keyPointIds.map(String).filter(Boolean) : [];
    if (!templateId) throw new Error("请选择教研模板后再生成 AI 初稿");
    if (keyPointIds.length === 0) throw new Error("请选择高频考点后再生成 AI 初稿");

    const content = await prisma.teachingContent.findUnique({ where: { id } });
    if (!content) return NextResponse.json({ error: "内容不存在" }, { status: 404 });
    const [template, keyPoints] = await Promise.all([
      prisma.teachingContentTemplate.findFirst({ where: { id: templateId, enabled: true } }),
      prisma.teachingKeyPoint.findMany({ where: { id: { in: keyPointIds } }, orderBy: [{ frequency: "desc" }, { updatedAt: "desc" }] })
    ]);
    if (!template) throw new Error("教研模板不存在或已停用");
    if (keyPoints.length === 0) throw new Error("所选高频考点不存在");
    const body = buildTemplateDrivenDraft({
      title: content.title,
      type: content.type,
      category: content.category,
      subject: template.subject,
      chapter: template.chapter,
      template,
      keyPoints
    });
    const nextVersion = content.currentVersion + 1;
    const item = await prisma.$transaction(async (tx) => {
      await tx.teachingContent.update({
        where: { id },
        data: {
          body,
          currentVersion: nextVersion,
          summary: content.summary || "模板驱动 AI 初稿",
          aiPrompt: [
            content.aiPrompt,
            `模板结构：${template.structureMarkdown}`,
            `高频考点：${keyPoints.map((point) => `${point.name}｜命题方向：${point.direction}｜易错点：${point.mistakes}`).join("；")}`
          ].filter(Boolean).join("\n")
        }
      });
      await tx.teachingContentVersion.create({
        data: { contentId: id, version: nextVersion, title: content.title, body, changeNote: "根据模板和高频考点生成初稿" }
      });
      return tx.teachingContent.findUniqueOrThrow({
        where: { id },
        include: { versions: { orderBy: { version: "desc" }, take: 5 } }
      });
    });
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error, 500);
  }
}
