"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { findLoginUser } from "@/lib/login-identity";
import { getFirstAllowedPath } from "@/lib/permissions";
import { createSession, destroySession } from "@/lib/session";

export type LoginState = {
  error?: string;
};

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const identifier = String(formData.get("identifier") || "").trim();
  const password = String(formData.get("password") || "");

  if (!identifier || !password) {
    return { error: "请输入手机号/身份证号和密码" };
  }

  const { user, error } = await findLoginUser(identifier);
  if (error) return { error };

  if (!user || user.status !== "ACTIVE") {
    return { error: "账号不存在或已停用" };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return { error: "账号或密码错误" };
  }

  await createSession(user.id);
  redirect(await getFirstAllowedPath(user));
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
