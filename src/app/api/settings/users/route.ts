import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { normalizeUserInput } from "@/lib/settings";

const include = {
  campus: { select: { id: true, name: true } }
};

export async function GET() {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;

  const items = await prisma.user.findMany({
    where: { organizationId: auth.user.organizationId },
    include,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const password = typeof body.password === "string" && body.password.trim() ? body.password.trim() : "Admin@123456";
    const item = await prisma.user.create({
      data: {
        ...normalizeUserInput(body, { organizationId: auth.user.organizationId }),
        passwordHash: await bcrypt.hash(password, 10)
      },
      include
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
