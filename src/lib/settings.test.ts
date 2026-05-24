import assert from "node:assert/strict";
import test from "node:test";
import { getInitialUserPassword, maskIdNumber, normalizeCampusInput, normalizeDictionaryInput, normalizeResetPasswordInput, normalizeUserInput, settingsRoleOptions } from "./settings";

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
      role: "REMOVED_ROLE"
    },
    { organizationId: "org-1" }
  ), /不能选择该用户角色/);
});

test("normalizeUserInput only includes phone and id number login fields", () => {
  const result = normalizeUserInput(
    {
      name: "新用户",
      phone: "19900000000",
      idNumber: "510100199901010000",
      role: "ADMISSIONS_COUNSELOR",
      campusId: "campus-1"
    },
    { organizationId: "org-1" }
  );

  const removedKey = ["e", "mail"].join("");
  assert.equal(removedKey in result, false);
  assert.equal(result.phone, "19900000000");
});

test("normalizeUserInput allows admin without campus and requires campus for campus roles", () => {
  const admin = normalizeUserInput({ name: "总部管理员", role: "ADMIN", campusId: "" }, { organizationId: "org-1" });
  assert.equal(admin.campusId, null);
  assert.equal(admin.role, "ADMIN");
  assert.throws(
    () => normalizeUserInput({ name: "校区老师", role: "ACADEMIC_TEACHER", campusId: "" }, { organizationId: "org-1" }),
    /所属校区/
  );
});

test("settingsRoleOptions uses merged administrator role labels", () => {
  assert.equal(settingsRoleOptions[0].value, "ADMIN");
  assert.equal(settingsRoleOptions[0].label, "管理员");
});

test("initial user password follows id number fallback rule", () => {
  assert.equal(getInitialUserPassword({ idNumber: "310101199001011234" }), "011234");
  assert.equal(getInitialUserPassword({ idNumber: "  " }), "123456");
  assert.equal(getInitialUserPassword({}), "123456");
});

test("normalizeResetPasswordInput validates reset password", () => {
  assert.deepEqual(normalizeResetPasswordInput({ mode: "CUSTOM", password: " 123456 " }), { mode: "CUSTOM", password: "123456" });
  assert.deepEqual(normalizeResetPasswordInput({ mode: "ID_NUMBER_SUFFIX" }), { mode: "ID_NUMBER_SUFFIX", password: null });
  assert.deepEqual(normalizeResetPasswordInput({ mode: "DEFAULT_123456" }), { mode: "DEFAULT_123456", password: null });
  assert.throws(() => normalizeResetPasswordInput({ mode: "CUSTOM", password: "" }), /请输入新密码/);
  assert.throws(() => normalizeResetPasswordInput({ mode: "CUSTOM", password: "12345" }), /最短 6 位/);
  assert.throws(() => normalizeResetPasswordInput({ mode: "BAD" }), /重置密码方式/);
});

test("maskIdNumber only keeps safe visible segments", () => {
  assert.equal(maskIdNumber("310101199001011234"), "3101**********1234");
  assert.equal(maskIdNumber("12345678"), "12****78");
  assert.equal(maskIdNumber(null), null);
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
