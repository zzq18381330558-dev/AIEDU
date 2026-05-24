import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import {
  createBusinessDictionary,
  findBusinessDictionaryDuplicate,
  listBusinessDictionaryCategories,
  listBusinessDictionaries
} from "@/lib/settings-dictionary-db";
import { normalizeDictionaryInput } from "@/lib/settings";

export async function GET() {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "仅管理员可以管理字典" }, { status: 403 });

  const [items, categories] = await Promise.all([
    listBusinessDictionaries(auth.user.organizationId),
    listBusinessDictionaryCategories()
  ]);

  return NextResponse.json({ items, categories });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/settings");
  if ("response" in auth) return auth.response;
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "仅管理员可以管理字典" }, { status: 403 });

  try {
    const body = await request.json();
    const data = normalizeDictionaryInput(body, { organizationId: auth.user.organizationId });
    const duplicate = await findBusinessDictionaryDuplicate(data);
    if (duplicate) return NextResponse.json({ error: "同一分类下已存在相同字典名称" }, { status: 400 });

    const item = await createBusinessDictionary(data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
