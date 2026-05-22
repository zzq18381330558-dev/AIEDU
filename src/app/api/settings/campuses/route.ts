import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { normalizeCampusInput } from "@/lib/settings";

const include = {
  manager: { select: { id: true, name: true } },
  _count: { select: { users: true, leads: true, students: true } }
};

export async function GET() {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;

  const items = await prisma.campus.findMany({
    where: { organizationId: auth.user.organizationId },
    include,
    orderBy: [{ status: "asc" }, { name: "asc" }]
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const item = await prisma.campus.create({
      data: normalizeCampusInput(body, { organizationId: auth.user.organizationId }),
      include
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
