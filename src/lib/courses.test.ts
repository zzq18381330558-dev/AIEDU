import assert from "node:assert/strict";
import test from "node:test";
import { getNavItems } from "./nav";
import { canAccess } from "./roles";
import { canManageCourse, normalizeChapterUpdateInput, normalizeLessonUpdateInput } from "./courses";

test("normalizeChapterUpdateInput validates title and keeps sort order", () => {
  assert.throws(() => normalizeChapterUpdateInput({ title: "" }), /章节标题/);

  const result = normalizeChapterUpdateInput({
    title: " 第一章 职业理念 ",
    description: " 基础导学 ",
    sortOrder: "2"
  });

  assert.equal(result.title, "第一章 职业理念");
  assert.equal(result.description, "基础导学");
  assert.equal(result.sortOrder, 2);
});

test("normalizeLessonUpdateInput updates optional bindings", () => {
  const result = normalizeLessonUpdateInput({
    title: " 第一课 ",
    summary: " 核心考点 ",
    durationMinutes: "45",
    sortOrder: "3",
    teachingContentId: "content-1",
    questionPaperId: "paper-1"
  });

  assert.equal(result.title, "第一课");
  assert.equal(result.summary, "核心考点");
  assert.equal(result.durationMinutes, 45);
  assert.equal(result.sortOrder, 3);
  assert.equal(result.teachingContentId, "content-1");
  assert.equal(result.questionPaperId, "paper-1");
});

test("course center menu permissions match V0.7 launch rules", () => {
  assert.ok(getNavItems("ADMIN").some((item) => item.href === "/courses"));
  assert.ok(getNavItems("CAMPUS_MANAGER").some((item) => item.href === "/courses"));
  assert.ok(getNavItems("ACADEMIC_TEACHER").some((item) => item.href === "/courses"));
  assert.ok(getNavItems("LECTURER").some((item) => item.href === "/courses"));
  assert.ok(!getNavItems("ADMISSIONS_COUNSELOR").some((item) => item.href === "/courses"));

  assert.equal(canAccess("ADMIN", "/courses"), true);
  assert.equal(canAccess("CAMPUS_MANAGER", "/courses"), true);
  assert.equal(canAccess("ACADEMIC_TEACHER", "/courses"), true);
  assert.equal(canAccess("LECTURER", "/courses"), true);
  assert.equal(canAccess("ADMISSIONS_COUNSELOR", "/courses"), false);
});

test("course center write permissions keep teacher roles read-only", () => {
  assert.equal(canManageCourse("ADMIN"), true);
  assert.equal(canManageCourse("CAMPUS_MANAGER"), true);
  assert.equal(canManageCourse("ACADEMIC_TEACHER"), false);
  assert.equal(canManageCourse("LECTURER"), false);
  assert.equal(canManageCourse("ADMISSIONS_COUNSELOR"), false);
});
