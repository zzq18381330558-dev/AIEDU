import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { normalizeDictionaryInput } from "@/lib/settings";

export async function GET() {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;

  const items = await prisma.businessDictionary.findMany({
    where: { organizationId: auth.user.organizationId },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const item = await prisma.businessDictionary.create({
      data: normalizeDictionaryInput(body, { organizationId: auth.user.organizationId })
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
