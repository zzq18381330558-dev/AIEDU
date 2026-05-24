export type PermissionResolutionSource = "user" | "role" | "default";

export type PermissionResolutionInput = {
  userConfigured: boolean;
  roleConfigured: boolean;
  userLatestUpdatedAt: Date | null;
  roleLatestUpdatedAt: Date | null;
};

export function resolvePermissionSource({
  userConfigured,
  roleConfigured,
  userLatestUpdatedAt,
  roleLatestUpdatedAt
}: PermissionResolutionInput): PermissionResolutionSource {
  if (!userConfigured) return roleConfigured ? "role" : "default";
  if (!roleConfigured) return "user";
  if (!roleLatestUpdatedAt) return "user";
  if (!userLatestUpdatedAt) return "role";
  return userLatestUpdatedAt >= roleLatestUpdatedAt ? "user" : "role";
}
