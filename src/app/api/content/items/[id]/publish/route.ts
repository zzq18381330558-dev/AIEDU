import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { canReviewTeachingContent } from "@/lib/teaching-content";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/content");
  if ("response" in auth) return auth.response;
  if (!canReviewTeachingContent(auth.user.role)) return NextResponse.json({ error: "无权发布内容" }, { status: 403 });

  try {
    const { id } = await context.params;
    const body = await request.json();
    const campusIds: string[] = Array.isArray(body.campusIds)
      ? body.campusIds.map(String)
      : [String(body.campusId || "")].filter(Boolean);
    if (campusIds.length === 0) throw new Error("请选择发布校区");

    await prisma.$transaction([
      prisma.teachingContent.update({ where: { id }, data: { status: "PUBLISHED" } }),
      ...campusIds.map((campusId) =>
        prisma.teachingContentPublication.upsert({
          where: { contentId_campusId: { contentId: id, campusId } },
          update: { publishedAt: new Date() },
          create: { contentId: id, campusId }
        })
      )
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
