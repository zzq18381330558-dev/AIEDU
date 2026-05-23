import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { canManageTeachingContent, normalizeTemplateInput } from "@/lib/teaching-content";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireApiUser("/content");
  if ("response" in auth) return auth.response;

  const items = await prisma.teachingContentTemplate.findMany({
    orderBy: [{ enabled: "desc" }, { updatedAt: "desc" }],
    take: 100
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/content");
  if ("response" in auth) return auth.response;
  if (!canManageTeachingContent(auth.user.role)) return NextResponse.json({ error: "无权维护教研模板" }, { status: 403 });

  try {
    const body = await request.json();
    const item = await prisma.teachingContentTemplate.create({ data: normalizeTemplateInput(body) });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
