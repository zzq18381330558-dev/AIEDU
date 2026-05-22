import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAiDraft,
  exportFileName,
  nextStatusByAction,
  normalizeContentInput,
  parseReviewAction,
  renderPdfUnavailableHtml,
  renderExportHtml
} from "./teaching-content";

test("normalizeContentInput validates title and defaults category", () => {
  const result = normalizeContentInput(
    {
      title: " 综合素质讲义 ",
      type: "COURSE_HANDOUT",
      body: "正文"
    },
    { authorId: "u1" }
  );

  assert.equal(result.title, "综合素质讲义");
  assert.equal(result.category, "教资培训");
  assert.equal(result.authorId, "u1");
});

test("buildAiDraft creates structured draft", () => {
  const draft = buildAiDraft({
    title: "作文模板",
    type: "WRITING_TEMPLATE",
    category: "综合素质",
    aiPrompt: "突出开头结尾模板"
  });

  assert.match(draft, /作文模板/);
  assert.match(draft, /教研审核关注点/);
});

test("nextStatusByAction maps review actions", () => {
  assert.equal(nextStatusByAction("SUBMIT"), "REVIEWING");
  assert.equal(nextStatusByAction("APPROVE"), "APPROVED");
  assert.equal(nextStatusByAction("REJECT"), "DRAFT");
  assert.equal(nextStatusByAction("ARCHIVE"), "ARCHIVED");
});

test("parseReviewAction rejects invalid actions with friendly message", () => {
  assert.equal(parseReviewAction("ARCHIVE"), "ARCHIVE");
  assert.throws(() => parseReviewAction("DELETE"), /审核动作无效/);
});

test("export helpers produce safe file and escaped html", () => {
  assert.equal(exportFileName("a/b:c", "WORD"), "a_b_c.doc");
  const html = renderExportHtml({ title: "<标题>", summary: null, body: "<script>" });
  assert.match(html, /&lt;标题&gt;/);
  assert.doesNotMatch(html, /<script>/);
  const pdfTip = renderPdfUnavailableHtml("<标题>");
  assert.match(pdfTip, /PDF 导出暂未接入/);
  assert.doesNotMatch(pdfTip, /<标题>/);
});
