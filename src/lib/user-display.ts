export type DisplayUser = {
  realName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export function getUserDisplayName(user?: DisplayUser | null, fallback = "-") {
  if (!user) return fallback;
  return user.realName?.trim() || user.name?.trim() || user.email?.trim() || user.phone?.trim() || fallback;
}
