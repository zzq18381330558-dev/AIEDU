import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument } from "pdf-lib";
import { buildTeachingContentPdf, exportPdfFileName } from "./pdf-export";

test("exportPdfFileName sanitizes unsafe title characters", () => {
  assert.equal(exportPdfFileName("中学/综合素质:讲义"), "中学_综合素质_讲义.pdf");
});

test("buildTeachingContentPdf creates a multi-page Chinese teaching PDF", async () => {
  const pdf = await buildTeachingContentPdf({
    title: "《中学综合素质》第一章《职业理念》完整教研讲义",
    category: "中学综合素质",
    summary: "测试摘要",
    body: [
      "# 《中学综合素质》第一章《职业理念》完整教研讲义",
      "",
      "## 一、考情分析",
      "",
      "| 项目 | 考查情况 |",
      "|---|---|",
      "| 科目 | 中学《综合素质》 |",
      "| 高频考点 | 素质教育、学生观、教师观 |",
      "",
      "## 高频考点",
      "",
      "- 素质教育",
      "- 学生观",
      "",
      "## 真题例题",
      "",
      "某教师只关注优等生，该做法违背了什么？",
      "",
      "**答案：** A",
      "",
      "## 易错点",
      "",
      "素质教育不等于不要考试。",
      "",
      "## 记忆口诀",
      "",
      "全体全面个性创实",
      "",
      "## 主观题模板",
      "",
      "材料中教师的做法体现了……"
    ].join("\n"),
    brandName: "教资教研中心",
    year: 2026
  });
  const doc = await PDFDocument.load(pdf);
  assert.ok(pdf.length > 10_000);
  assert.ok(doc.getPageCount() >= 3);
});
