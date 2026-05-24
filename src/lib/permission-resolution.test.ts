import assert from "node:assert/strict";
import test from "node:test";
import { resolvePermissionSource } from "./permission-resolution";

test("resolvePermissionSource uses role when user has no personal permissions", () => {
  assert.equal(resolvePermissionSource({
    userConfigured: false,
    roleConfigured: true,
    userLatestUpdatedAt: null,
    roleLatestUpdatedAt: new Date("2026-05-24T10:00:00Z")
  }), "role");
});

test("resolvePermissionSource falls back to default role permissions when no records exist", () => {
  assert.equal(resolvePermissionSource({
    userConfigured: false,
    roleConfigured: false,
    userLatestUpdatedAt: null,
    roleLatestUpdatedAt: null
  }), "default");
});

test("resolvePermissionSource lets the newest permission group win", () => {
  const firstRoleUpdate = new Date("2026-05-24T10:00:00Z");
  const personalUpdate = new Date("2026-05-24T11:00:00Z");
  const secondRoleUpdate = new Date("2026-05-24T12:00:00Z");

  assert.equal(resolvePermissionSource({
    userConfigured: true,
    roleConfigured: true,
    userLatestUpdatedAt: new Date("2026-05-24T09:00:00Z"),
    roleLatestUpdatedAt: firstRoleUpdate
  }), "role");

  assert.equal(resolvePermissionSource({
    userConfigured: true,
    roleConfigured: true,
    userLatestUpdatedAt: personalUpdate,
    roleLatestUpdatedAt: firstRoleUpdate
  }), "user");

  assert.equal(resolvePermissionSource({
    userConfigured: true,
    roleConfigured: true,
    userLatestUpdatedAt: personalUpdate,
    roleLatestUpdatedAt: secondRoleUpdate
  }), "role");
});
