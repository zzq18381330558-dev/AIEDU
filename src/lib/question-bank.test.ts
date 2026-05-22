import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAiAnalysis,
  buildPaperStrategy,
  buildWeaknessRows,
  normalizeImportQuestionRow,
  normalizeQuestionInput
} from "./question-bank";

test("normalizeQuestionInput validates and normalizes question fields", () => {
  const result = normalizeQuestionInput({
    subject: "COMPREHENSIVE_QUALITY",
    chapter: "职业理念",
    knowledgePoint: "学生观",
    type: "SINGLE_CHOICE",
    stem: "题干",
    options: "A. 选项一\nB. 选项二",
    answer: "A",
    difficulty: "8",
    highFrequencyTags: "学生观，职业理念",
    source: "REAL_EXAM",
    year: "2024"
  });

  assert.equal(result.difficulty, 5);
  assert.deepEqual(result.highFrequencyTags, ["学生观", "职业理念"]);
  assert.equal(result.source, "REAL_EXAM");
  assert.equal(result.year, 2024);
  assert.ok(result.options);
});

test("normalizeImportQuestionRow maps Chinese headers and labels", () => {
  const result = normalizeImportQuestionRow({
    科目: "教育知识与能力",
    题型: "简答",
    来源: "模拟题",
    题干: "简述学习动机",
    正确答案: "略"
  });

  assert.equal(result.subject, "EDUCATION_KNOWLEDGE");
  assert.equal(result.type, "SHORT_ANSWER");
  assert.equal(result.source, "MOCK");
});

test("buildAiAnalysis includes answer and knowledge point", () => {
  const analysis = buildAiAnalysis({
    subject: "COMPREHENSIVE_QUALITY",
    chapter: "职业理念",
    knowledgePoint: "学生观",
    type: "SINGLE_CHOICE",
    stem: "题干",
    answer: "B",
    difficulty: 2,
    highFrequencyTags: ["学生观"]
  });

  assert.match(analysis, /正确答案/);
  assert.match(analysis, /学生观/);
});

test("buildPaperStrategy clamps count and difficulty", () => {
  const strategy = buildPaperStrategy({
    subject: "COMPREHENSIVE_QUALITY",
    count: "200",
    difficultyFrom: "0",
    difficultyTo: "9"
  });

  assert.equal(strategy.count, 100);
  assert.equal(strategy.difficultyFrom, 1);
  assert.equal(strategy.difficultyTo, 5);
});

test("buildWeaknessRows ranks unmastered difficult knowledge points", () => {
  const rows = buildWeaknessRows([
    {
      mastered: false,
      question: {
        subject: "COMPREHENSIVE_QUALITY",
        chapter: "职业理念",
        knowledgePoint: "学生观",
        difficulty: 4
      }
    },
    {
      mastered: true,
      question: {
        subject: "COMPREHENSIVE_QUALITY",
        chapter: "职业理念",
        knowledgePoint: "教师观",
        difficulty: 2
      }
    }
  ]);

  assert.equal(rows[0].knowledgePoint, "学生观");
  assert.equal(rows[0].unmastered, 1);
});
