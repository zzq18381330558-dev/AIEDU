import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAiAnalysis,
  buildPaperStrategy,
  buildWeaknessRows,
  normalizePaperInput,
  normalizePaperQuestionImportRow,
  validateImportHeaders,
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
    type: "SHORT_ANSWER",
    count: "200",
    difficultyFrom: "0",
    difficultyTo: "9",
    tags: "学生观，教师观"
  });

  assert.equal(strategy.count, 100);
  assert.equal(strategy.difficultyFrom, 1);
  assert.equal(strategy.difficultyTo, 5);
  assert.equal(strategy.type, "SHORT_ANSWER");
  assert.deepEqual(strategy.tags, ["学生观", "教师观"]);
});

test("normalizePaperInput validates paper metadata", () => {
  const result = normalizePaperInput({
    name: "2024下半年中学综合素质真题",
    type: "REAL_EXAM",
    subject: "COMPREHENSIVE_QUALITY",
    stage: "MIDDLE",
    year: "2024",
    totalScore: "150",
    duration: "120",
    difficulty: "HARD"
  });

  assert.equal(result.title, "2024下半年中学综合素质真题");
  assert.equal(result.paperType, "REAL_EXAM");
  assert.equal(result.stage, "MIDDLE");
  assert.equal(result.totalScore, 150);
});

test("normalizePaperQuestionImportRow maps set-import columns", () => {
  const result = normalizePaperQuestionImportRow(
    {
      题号: "1",
      题型: "单选题",
      题目: "下列说法正确的是",
      选项A: "正确项",
      选项B: "干扰项",
      正确答案: "A",
      难度: "中等",
      考点: "学生观",
      分值: "2"
    },
    {
      paperId: "paper-1",
      subject: "COMPREHENSIVE_QUALITY",
      year: 2024,
      source: "REAL_EXAM"
    }
  );

  assert.equal(result.paperId, "paper-1");
  assert.equal(result.questionNo, "1");
  assert.equal(result.type, "SINGLE_CHOICE");
  assert.equal(result.difficulty, 3);
  assert.equal(result.score, 2);
});

test("validateImportHeaders reports missing Chinese columns", () => {
  assert.throws(() => validateImportHeaders(["题号", "题型"], ["题号", "题目"]), /缺少关键列：题目/);
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
