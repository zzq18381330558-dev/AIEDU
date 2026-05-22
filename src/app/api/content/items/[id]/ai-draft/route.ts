import { NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildAiDraft, canManageTeachingContent } from "@/lib/teaching-content";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiUser("/content");
    if ("response" in auth) return auth.response;
    if (!canManageTeachingContent(auth.user.role)) return NextResponse.json({ error: "无权生成内容" }, { status: 403 });

    const { id } = await context.params;
    const content = await prisma.teachingContent.findUnique({ where: { id } });
    if (!content) return NextResponse.json({ error: "内容不存在" }, { status: 404 });
    const body = buildAiDraft(content);
    const nextVersion = content.currentVersion + 1;
    const item = await prisma.$transaction(async (tx) => {
      await tx.teachingContent.update({
        where: { id },
        data: { body, currentVersion: nextVersion, summary: content.summary || "AI 生成初稿" }
      });
      await tx.teachingContentVersion.create({
        data: { contentId: id, version: nextVersion, title: content.title, body, changeNote: "AI 生成初稿" }
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
