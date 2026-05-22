import assert from "node:assert/strict";
import test from "node:test";
import { exportPptFileName, parseMarkdownToPptSlides } from "./ppt-export";

test("exportPptFileName combines course and chapter safely", () => {
  assert.equal(exportPptFileName("中学/综合素质", "第二章:教育法律法规"), "中学_综合素质-第二章_教育法律法规.pptx");
});

test("parseMarkdownToPptSlides creates chapter, table, focus, exercise and summary slides", () => {
  const slides = parseMarkdownToPptSlides(
    [
      "# 第一章 职业理念",
      "## 高频考点",
      "- 重点：素质教育",
      "- 易错：只看分数",
      "| 模块 | 内容 |",
      "|---|---|",
      "| 学生观 | 发展的人 |",
      "## 课堂练习",
      "1. 下列说法正确的是？",
      "A. 只看成绩",
      "B. 尊重差异",
      "答案：B",
      "## 本章总结",
      "- 教育观",
      "- 学生观"
    ].join("\n"),
    "综合素质"
  );

  assert.ok(slides.some((slide) => slide.kind === "chapter" && slide.title === "第一章 职业理念"));
  assert.ok(slides.some((slide) => slide.kind === "focus"));
  assert.ok(slides.some((slide) => slide.kind === "table" && slide.table?.[0]?.[0] === "模块"));
  assert.ok(slides.some((slide) => slide.kind === "exercise"));
  assert.ok(slides.some((slide) => slide.kind === "summary"));
  assert.ok(slides.every((slide) => (slide.lines?.length || 0) <= 6));
});
