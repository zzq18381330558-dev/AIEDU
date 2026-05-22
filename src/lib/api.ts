import { NextResponse } from "next/server";
import { canAccess } from "@/lib/roles";
import { getSessionUser } from "@/lib/session";

export async function requireApiUser(pathname: string) {
  const user = await getSessionUser();
  if (!user) {
    return { response: NextResponse.json({ error: "未登录" }, { status: 401 }) };
  }
  if (!canAccess(user.role, pathname)) {
    return { response: NextResponse.json({ error: "无权限访问" }, { status: 403 }) };
  }
  return { user };
}

export function jsonError(error: unknown, status = 400) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "请求处理失败" },
    { status }
  );
}
