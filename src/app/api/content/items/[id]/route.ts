import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { canManageTeachingContent, normalizeContentInput } from "@/lib/teaching-content";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/content");
  if ("response" in auth) return auth.response;
  if (!canManageTeachingContent(auth.user.role)) return NextResponse.json({ error: "无权编辑内容" }, { status: 403 });

  try {
    const { id } = await context.params;
    const body = await request.json();
    const input = normalizeContentInput(body, { authorId: auth.user.id });
    const current = await prisma.teachingContent.findUniqueOrThrow({ where: { id } });
    const nextVersion = current.currentVersion + 1;
    const item = await prisma.$transaction(async (tx) => {
      await tx.teachingContent.update({
        where: { id },
        data: {
          title: input.title,
          type: input.type,
          category: input.category,
          aiPrompt: input.aiPrompt,
          summary: input.summary,
          body: input.body,
          currentVersion: nextVersion
        }
      });
      await tx.teachingContentVersion.create({
        data: {
          contentId: id,
          version: nextVersion,
          title: input.title,
          body: input.body || "",
          changeNote: String(body.changeNote || "编辑保存")
        }
      });
      return tx.teachingContent.findUniqueOrThrow({
        where: { id },
        include: {
          author: { select: { id: true, name: true, email: true, phone: true } },
          _count: { select: { versions: true, reviews: true, publications: true, exports: true } }
        }
      });
    });
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}
