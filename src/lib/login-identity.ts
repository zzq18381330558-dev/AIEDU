import type { UserRole, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type LoginUser = {
  id: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
};

export async function findLoginUser(identifier: string): Promise<{ user: LoginUser | null; error?: string }> {
  const phoneUsers = await prisma.user.findMany({
    where: { phone: identifier, status: "ACTIVE" },
    select: { id: true, passwordHash: true, role: true, status: true },
    take: 2
  });
  if (phoneUsers.length > 1) return { user: null, error: "手机号重复，请联系管理员" };

  const idNumberUsers = await prisma.user.findMany({
    where: { idNumber: identifier, status: "ACTIVE" },
    select: { id: true, passwordHash: true, role: true, status: true },
    take: 2
  });
  if (idNumberUsers.length > 1) return { user: null, error: "身份证号重复，请联系管理员" };

  const phoneUser = phoneUsers[0] || null;
  const idNumberUser = idNumberUsers[0] || null;
  if (phoneUser && idNumberUser && phoneUser.id !== idNumberUser.id) {
    return { user: null, error: "登录账号存在歧义，请联系管理员" };
  }

  return { user: phoneUser || idNumberUser };
}
