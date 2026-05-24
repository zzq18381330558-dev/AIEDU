import assert from "node:assert/strict";
import test from "node:test";
import { normalizeChapterUpdateInput, normalizeLessonUpdateInput } from "./courses";

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
