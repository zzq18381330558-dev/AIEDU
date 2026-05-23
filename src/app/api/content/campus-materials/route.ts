import { NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await requireApiUser("/content");
    if ("response" in auth) return auth.response;

    const where =
      auth.user.role === "ADMIN" || auth.user.role === "HQ_OPERATIONS"
        ? {}
        : auth.user.campusId
          ? { campusId: auth.user.campusId }
          : { campusId: "__none__" };

    const items = await prisma.teachingContentPublication.findMany({
      where,
      include: {
        campus: { select: { name: true } },
        content: { include: { author: { select: { name: true, email: true, phone: true } } } }
      },
      orderBy: { publishedAt: "desc" },
      take: 100
    });
    return NextResponse.json({ items });
  } catch (error) {
    return jsonError(error, 500);
  }
}
