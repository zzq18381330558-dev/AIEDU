import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { canManageTeachingContent, normalizeKeyPointInput } from "@/lib/teaching-content";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireApiUser("/content");
  if ("response" in auth) return auth.response;

  const items = await prisma.teachingKeyPoint.findMany({
    orderBy: [{ frequency: "desc" }, { updatedAt: "desc" }],
    take: 200
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/content");
  if ("response" in auth) return auth.response;
  if (!canManageTeachingContent(auth.user.role)) return NextResponse.json({ error: "无权维护高频考点" }, { status: 403 });

  try {
    const body = await request.json();
    const item = await prisma.teachingKeyPoint.create({ data: normalizeKeyPointInput(body) });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
