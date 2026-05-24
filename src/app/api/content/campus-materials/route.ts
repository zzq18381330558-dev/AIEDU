import { NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildCampusMaterialScopeWhere } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await requireApiUser("/content/campus-materials");
    if ("response" in auth) return auth.response;

    const where = await buildCampusMaterialScopeWhere(auth.user);

    const items = await prisma.teachingContentPublication.findMany({
      where,
      include: {
        campus: { select: { name: true } },
        content: { include: { author: { select: { name: true, phone: true } } } }
      },
      orderBy: { publishedAt: "desc" },
      take: 100
    });
    return NextResponse.json({ items });
  } catch (error) {
    return jsonError(error, 500);
  }
}
