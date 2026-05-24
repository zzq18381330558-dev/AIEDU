export type DisplayUser = {
  realName?: string | null;
  name?: string | null;
  phone?: string | null;
};

export function getUserDisplayName(user?: DisplayUser | null, fallback = "-") {
  if (!user) return fallback;
  return user.realName?.trim() || user.name?.trim() || user.phone?.trim() || fallback;
}
