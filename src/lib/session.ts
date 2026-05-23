import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccess, roleHome } from "@/lib/roles";

const COOKIE_NAME = "ai_edu_session";
const DEFAULT_SESSION_SECRET = "local-dev-session-secret-change-me";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  campusId: string | null;
  organizationId: string;
};

type SessionPayload = {
  userId: string;
  exp: number;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET || DEFAULT_SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && secret === DEFAULT_SESSION_SECRET) {
    throw new Error("生产环境必须配置强随机 SESSION_SECRET，不能使用默认开发密钥。");
  }
  return secret;
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function encode(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(value?: string): SessionPayload | null {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature || sign(body) !== signature) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, encode({ userId, exp: expires.getTime() }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const payload = decode(cookieStore.get(COOKIE_NAME)?.value);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      campusId: true,
      organizationId: true,
      status: true
    }
  });

  if (!user || user.status !== "ACTIVE") return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    campusId: user.campusId,
    organizationId: user.organizationId
  };
}

export async function requireUser(pathname?: string) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (pathname && !canAccess(user.role, pathname)) redirect(roleHome[user.role]);
  return user;
}
