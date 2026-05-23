import { NextResponse } from "next/server";
import { canAccessPath } from "@/lib/permissions";
import { getSessionUser } from "@/lib/session";

export async function requireApiUser(pathname: string) {
  const user = await getSessionUser();
  if (!user) {
    return { response: NextResponse.json({ error: "未登录" }, { status: 401 }) };
  }
  if (!(await canAccessPath(user, pathname))) {
    return { response: NextResponse.json({ error: "无权限访问" }, { status: 403 }) };
  }
  return { user };
}

export function jsonError(error: unknown, status = 400) {
  return NextResponse.json(
    { error: getFriendlyErrorMessage(error) },
    { status }
  );
}

function getFriendlyErrorMessage(error: unknown) {
  if (error instanceof Error && /[\u4e00-\u9fa5]/.test(error.message)) {
    return error.message;
  }
  return "请求处理失败，请稍后重试";
}
