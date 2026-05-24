import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { canReviewTeachingContent, nextStatusByAction, parseReviewAction } from "@/lib/teaching-content";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/content");
  if ("response" in auth) return auth.response;
  if (!canReviewTeachingContent(auth.user.role)) return NextResponse.json({ error: "无权审核内容" }, { status: 403 });

  try {
    const { id } = await context.params;
    const body = await request.json();
    const action = parseReviewAction(body.action || "SUBMIT");
    const item = await prisma.$transaction(async (tx) => {
      await tx.teachingContentReview.create({
        data: {
          contentId: id,
          reviewerId: auth.user.id,
          action,
          comment: body.comment ? String(body.comment) : null
        }
      });
      return tx.teachingContent.update({
        where: { id },
        data: { status: nextStatusByAction(action) },
        include: { reviews: { include: { reviewer: { select: { name: true, phone: true } } }, orderBy: { createdAt: "desc" } } }
      });
    });
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}
