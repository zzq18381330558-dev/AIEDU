import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAiDraft,
  buildTemplateDrivenDraft,
  exportFileName,
  nextStatusByAction,
  normalizeKeyPointInput,
  normalizeTemplateInput,
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

test("template and key point inputs validate required teaching fields", () => {
  const template = normalizeTemplateInput({
    name: "综合素质讲义模板",
    subject: "综合素质",
    chapter: "职业理念",
    type: "COURSE_HANDOUT",
    structureMarkdown: "## 高频考点"
  });
  assert.equal(template.name, "综合素质讲义模板");
  assert.equal(template.enabled, true);

  const point = normalizeKeyPointInput({
    subject: "综合素质",
    chapter: "职业理念",
    name: "职业理念",
    frequency: "5",
    questionTypes: "单选题、材料分析题",
    direction: "围绕学生观与教师观命题",
    mistakes: "概念混淆",
    keywords: "学生观,教师观"
  });
  assert.equal(point.frequency, 5);
  assert.throws(() => normalizeKeyPointInput({ ...point, frequency: 6 }), /高频指数/);
});

test("buildTemplateDrivenDraft includes template structure and key point constraints", () => {
  const draft = buildTemplateDrivenDraft({
    title: "职业理念讲义",
    type: "COURSE_HANDOUT",
    category: "教资培训",
    subject: "综合素质",
    chapter: "职业理念",
    template: { name: "综合素质讲义模板", structureMarkdown: "## 高频考点\n\n## 易错提醒" },
    keyPoints: [{
      name: "职业理念",
      frequency: 5,
      questionTypes: "单选题、材料分析题",
      direction: "围绕学生观、教师观命题",
      mistakes: "把学生是发展中的人与完整的人混淆",
      keywords: "学生观,教师观",
      note: null
    }]
  });

  assert.match(draft, /不允许脱离模板自由生成/);
  assert.match(draft, /## 高频考点/);
  assert.match(draft, /职业理念/);
  assert.match(draft, /命题方向/);
  assert.match(draft, /易错点/);
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
