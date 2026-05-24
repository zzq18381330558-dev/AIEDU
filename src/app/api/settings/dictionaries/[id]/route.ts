import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  findBusinessDictionaryDuplicate,
  updateBusinessDictionary
} from "@/lib/settings-dictionary-db";
import { normalizeDictionaryInput } from "@/lib/settings";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "仅管理员可以管理字典" }, { status: 403 });
  const { id } = await context.params;

  try {
    const exists = await prisma.businessDictionary.findFirst({
      where: { id, organizationId: auth.user.organizationId },
      select: { id: true }
    });
    if (!exists) return NextResponse.json({ error: "字典项不存在" }, { status: 404 });

    const body = await request.json();
    const data = normalizeDictionaryInput(body, { organizationId: auth.user.organizationId });
    const duplicate = await findBusinessDictionaryDuplicate(data, id);
    if (duplicate) return NextResponse.json({ error: "同一分类下已存在相同字典名称" }, { status: 400 });

    const item = await updateBusinessDictionary(id, data);
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}
