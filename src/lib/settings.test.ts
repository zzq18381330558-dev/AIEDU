import assert from "node:assert/strict";
import test from "node:test";
import { normalizeCampusInput, normalizeDictionaryInput, normalizeUserInput, settingsRoleOptions } from "./settings";

test("settingsRoleOptions exposes only five base roles", () => {
  assert.deepEqual(
    settingsRoleOptions.map((item) => item.value),
    ["ADMIN", "CAMPUS_MANAGER", "ADMISSIONS_COUNSELOR", "ACADEMIC_TEACHER", "LECTURER"]
  );
});

test("normalizeUserInput rejects removed roles", () => {
  assert.throws(() => normalizeUserInput(
    {
      name: "新用户",
      email: "new@example.com",
      role: "REMOVED_ROLE"
    },
    { organizationId: "org-1" }
  ), /不能选择该用户角色/);
});

test("settingsRoleOptions uses merged administrator role labels", () => {
  assert.equal(settingsRoleOptions[0].value, "ADMIN");
  assert.equal(settingsRoleOptions[0].label, "管理员");
});

test("normalizeCampusInput validates required fields and status", () => {
  assert.throws(() => normalizeCampusInput({ name: "", code: "", city: "" }, { organizationId: "org-1" }), /校区名称/);

  const result = normalizeCampusInput(
    {
      name: "杭州校区",
      code: " hz ",
      city: "杭州",
      status: "DISABLED",
      businessType: "FRANCHISE"
    },
    { organizationId: "org-1" }
  );

  assert.equal(result.code, "HZ");
  assert.equal(result.status, "DISABLED");
  assert.equal(result.businessType, "FRANCHISE");
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
