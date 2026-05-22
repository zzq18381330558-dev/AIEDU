import assert from "node:assert/strict";
import test from "node:test";
import { normalizeCampusInput, normalizeDictionaryInput, normalizeUserInput, settingsRoleOptions } from "./settings";

test("settingsRoleOptions exposes only five base roles", () => {
  assert.deepEqual(
    settingsRoleOptions.map((item) => item.value),
    ["ADMIN", "CAMPUS_MANAGER", "ADMISSIONS_COUNSELOR", "ACADEMIC_TEACHER", "LECTURER"]
  );
});

test("normalizeUserInput rejects HQ_OPERATIONS when creating user", () => {
  assert.throws(() => normalizeUserInput(
    {
      name: "新用户",
      email: "new@example.com",
      role: "HQ_OPERATIONS"
    },
    { organizationId: "org-1" }
  ), /不能选择该用户角色/);
});

test("normalizeUserInput can preserve historical HQ_OPERATIONS during edit", () => {
  const result = normalizeUserInput(
    {
      name: "总部运营",
      email: "ops@example.com",
      role: "HQ_OPERATIONS"
    },
    { organizationId: "org-1" },
    { allowLegacyRoles: true }
  );

  assert.equal(result.role, "HQ_OPERATIONS");
});

test("normalizeCampusInput validates required fields and status", () => {
  assert.throws(() => normalizeCampusInput({ name: "", code: "", city: "" }, { organizationId: "org-1" }), /校区名称/);

  const result = normalizeCampusInput(
    {
      name: "杭州校区",
      code: " hz ",
      city: "杭州",
      status: "DISABLED"
    },
    { organizationId: "org-1" }
  );

  assert.equal(result.code, "HZ");
  assert.equal(result.status, "DISABLED");
});

test("normalizeDictionaryInput validates name and enabled flag", () => {
  assert.throws(() => normalizeDictionaryInput({ name: "" }, { organizationId: "org-1" }), /字典名称/);

  const result = normalizeDictionaryInput(
    {
      category: "CLASS_TYPE",
      name: "晚班",
      value: "NIGHT",
      enabled: "false",
      sortOrder: "3"
    },
    { organizationId: "org-1" }
  );

  assert.equal(result.category, "CLASS_TYPE");
  assert.equal(result.enabled, false);
  assert.equal(result.sortOrder, 3);
});
