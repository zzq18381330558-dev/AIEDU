import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { normalizeResetPasswordInput } from "@/lib/settings";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  if (auth.user.role !== "ADMIN") {
    return NextResponse.json({ error: "仅管理员可以重置密码" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const input = normalizeResetPasswordInput(body);
    const target = await prisma.user.findFirst({
      where: { id, organizationId: auth.user.organizationId },
      select: { id: true, idNumber: true }
    });
    if (!target) return NextResponse.json({ error: "目标用户不存在" }, { status: 404 });

    const password = input.mode === "CUSTOM"
      ? input.password
      : input.mode === "DEFAULT_123456"
        ? "123456"
        : target.idNumber?.slice(-6);
    if (!password) {
      return NextResponse.json({ error: "该用户未填写身份证号" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(password, 10) },
      select: { id: true }
    });

    return NextResponse.json({ ok: true, message: "密码已重置" });
  } catch (error) {
    return jsonError(error);
  }
}
