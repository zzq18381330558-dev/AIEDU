import assert from "node:assert/strict";
import test from "node:test";
import { getUserDisplayName } from "./user-display";

test("getUserDisplayName uses the shared real name fallback order", () => {
  assert.equal(getUserDisplayName({ realName: " 周自强 ", name: "系统管理员", email: "admin@example.com" }), "周自强");
  assert.equal(getUserDisplayName({ name: "系统管理员", email: "admin@example.com" }), "系统管理员");
  assert.equal(getUserDisplayName({ email: "admin@example.com", phone: "13800000000" }), "admin@example.com");
  assert.equal(getUserDisplayName({ phone: "13800000000" }), "13800000000");
  assert.equal(getUserDisplayName(null, "未分配"), "未分配");
});
