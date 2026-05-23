import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { normalizeUserInput } from "@/lib/settings";

const include = {
  campus: { select: { id: true, name: true } }
};

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  try {
    const exists = await prisma.user.findFirst({
      where: { id, organizationId: auth.user.organizationId },
      select: { id: true, role: true }
    });
    if (!exists) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    const body = await request.json();
    const item = await prisma.user.update({
      where: { id },
      data: normalizeUserInput(body, { organizationId: auth.user.organizationId }),
      include
    });
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}
