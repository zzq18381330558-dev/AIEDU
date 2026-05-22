import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import { canManageTeachingContent, normalizeContentInput } from "@/lib/teaching-content";
import { prisma } from "@/lib/prisma";

const include = {
  author: { select: { id: true, name: true } },
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
  if (!canManageTeachingContent(auth.user.role)) return NextResponse.json({ error: "无权创建内容" }, { status: 403 });

  try {
    const body = await request.json();
    const input = normalizeContentInput(body, { authorId: auth.user.id });
    const item = await prisma.$transaction(async (tx) => {
      const content = await tx.teachingContent.create({ data: input });
      await tx.teachingContentVersion.create({
        data: {
          contentId: content.id,
          version: 1,
          title: content.title,
          body: content.body || "",
          changeNote: "创建内容"
        }
      });
      return tx.teachingContent.findUniqueOrThrow({ where: { id: content.id }, include });
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
