import type {
  Prisma,
  QuestionSource,
  QuestionSubject,
  QuestionType,
  UserRole
} from "@prisma/client";

export const subjectOptions: Array<{ value: QuestionSubject; label: string }> = [
  { value: "COMPREHENSIVE_QUALITY", label: "综合素质" },
  { value: "EDUCATION_KNOWLEDGE", label: "教育知识与能力" },
  { value: "SUBJECT_KNOWLEDGE", label: "学科知识" },
  { value: "INTERVIEW_STRUCTURED", label: "面试结构化" },
  { value: "TRIAL_LECTURE", label: "试讲" },
  { value: "DEFENSE", label: "答辩" }
];

export const questionTypeOptions: Array<{ value: QuestionType; label: string }> = [
  { value: "SINGLE_CHOICE", label: "单选" },
  { value: "MATERIAL_ANALYSIS", label: "材料分析" },
  { value: "WRITING", label: "作文" },
  { value: "SHORT_ANSWER", label: "简答" },
  { value: "DISCRIMINATION", label: "辨析" },
  { value: "CASE_ANALYSIS", label: "案例分析" }
];

export const questionSourceOptions: Array<{ value: QuestionSource; label: string }> = [
  { value: "REAL_EXAM", label: "真题" },
  { value: "MOCK", label: "模拟题" },
  { value: "ORIGINAL", label: "自编题" }
];

export const questionBankLabels = {
  subject: Object.fromEntries(subjectOptions.map((item) => [item.value, item.label])) as Record<
    QuestionSubject,
    string
  >,
  type: Object.fromEntries(questionTypeOptions.map((item) => [item.value, item.label])) as Record<
    QuestionType,
    string
  >,
  source: Object.fromEntries(questionSourceOptions.map((item) => [item.value, item.label])) as Record<
    QuestionSource,
    string
  >
};

const subjectValues = subjectOptions.map((item) => item.value);
const typeValues = questionTypeOptions.map((item) => item.value);
const sourceValues = questionSourceOptions.map((item) => item.value);

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: unknown) {
  const valueText = text(value);
  return valueText ? valueText : null;
}

function numberOr(value: unknown, fallback: number) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function enumOr<T extends string>(value: unknown, values: readonly T[], fallback: T) {
  return typeof value === "string" && values.includes(value as T) ? (value as T) : fallback;
}

function listFrom(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return text(value)
    .split(/[，,;；\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function optionalEnum<T extends string>(value: unknown, values: readonly T[]) {
  return typeof value === "string" && values.includes(value as T) ? (value as T) : undefined;
}

function optionsFrom(value: unknown) {
  if (!value) return undefined;
  if (typeof value === "object") return value as Prisma.InputJsonValue;
  const raw = text(value);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as Prisma.InputJsonValue;
  } catch {
    const options = raw
      .split(/\n|；|;/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item, index) => ({
        key: item.match(/^[A-Z]/)?.[0] || String.fromCharCode(65 + index),
        text: item.replace(/^[A-Z][、.．\s]*/, "")
      }));
    return options.length ? options : undefined;
  }
}

export function canManageQuestionBank(role: UserRole) {
  return ["ADMIN", "HQ_OPERATIONS", "ACADEMIC_TEACHER", "LECTURER"].includes(role);
}

export function normalizeQuestionInput(input: Record<string, unknown>) {
  const stem = text(input.stem);
  const answer = text(input.answer);
  const chapter = text(input.chapter) || "未分类章节";
  const knowledgePoint = text(input.knowledgePoint) || "未分类知识点";

  if (!stem) throw new Error("请输入题干");
  if (!answer) throw new Error("请输入正确答案");

  const difficulty = Math.min(5, Math.max(1, numberOr(input.difficulty, 3)));

  const options = optionsFrom(input.options);
  return {
    questionBankId: nullableText(input.questionBankId),
    subject: enumOr(input.subject, subjectValues, "COMPREHENSIVE_QUALITY"),
    chapter,
    knowledgePoint,
    type: enumOr(input.type, typeValues, "SINGLE_CHOICE"),
    stem,
    options,
    answer,
    analysis: nullableText(input.analysis),
    difficulty,
    highFrequencyTags: listFrom(input.highFrequencyTags || input.tags),
    source: enumOr(input.source, sourceValues, "ORIGINAL"),
    year: input.year ? numberOr(input.year, new Date().getFullYear()) : null
  } satisfies Prisma.QuestionUncheckedCreateInput;
}

export function buildAiAnalysis(question: {
  subject: QuestionSubject;
  chapter: string;
  knowledgePoint: string;
  type: QuestionType;
  stem: string;
  answer: string;
  difficulty: number;
  highFrequencyTags: string[];
}) {
  const tags = question.highFrequencyTags.length ? question.highFrequencyTags.join("、") : question.knowledgePoint;
  return [
    `【考查范围】${questionBankLabels.subject[question.subject]} / ${question.chapter} / ${question.knowledgePoint}`,
    `【题型难度】${questionBankLabels.type[question.type]}，难度 ${question.difficulty}/5。`,
    `【正确答案】${question.answer}`,
    `【解析思路】本题围绕“${tags}”展开。作答时先定位题干关键词，再匹配教师资格证考试中的核心概念，排除与题意不符或表述过度的选项/论点。`,
    "【备考提醒】建议把本题加入同知识点错题复盘，整理易混概念和答题模板。"
  ].join("\n");
}

export function normalizeImportQuestionRow(row: Record<string, unknown>) {
  const map: Record<string, string> = {
    科目: "subject",
    章节: "chapter",
    知识点: "knowledgePoint",
    题型: "type",
    题干: "stem",
    选项: "options",
    正确答案: "answer",
    解析: "analysis",
    难度: "difficulty",
    高频标签: "highFrequencyTags",
    来源: "source",
    年份: "year"
  };
  const aliases: Record<string, string> = {
    综合素质: "COMPREHENSIVE_QUALITY",
    教育知识与能力: "EDUCATION_KNOWLEDGE",
    学科知识: "SUBJECT_KNOWLEDGE",
    面试结构化: "INTERVIEW_STRUCTURED",
    试讲: "TRIAL_LECTURE",
    答辩: "DEFENSE",
    单选: "SINGLE_CHOICE",
    材料分析: "MATERIAL_ANALYSIS",
    作文: "WRITING",
    简答: "SHORT_ANSWER",
    辨析: "DISCRIMINATION",
    案例分析: "CASE_ANALYSIS",
    真题: "REAL_EXAM",
    模拟题: "MOCK",
    自编题: "ORIGINAL"
  };
  const input: Record<string, unknown> = {};
  for (const [header, key] of Object.entries(map)) {
    const value = row[header];
    input[key] = typeof value === "string" && aliases[value.trim()] ? aliases[value.trim()] : value;
  }
  return input;
}

export function buildPaperStrategy(input: Record<string, unknown>) {
  const difficultyFrom = Math.min(5, Math.max(1, numberOr(input.difficultyFrom, 1)));
  const difficultyTo = Math.min(5, Math.max(1, numberOr(input.difficultyTo, 5)));
  return {
    subject: enumOr(input.subject, subjectValues, "COMPREHENSIVE_QUALITY"),
    type: optionalEnum(input.type, typeValues) ?? null,
    count: Math.min(100, Math.max(1, numberOr(input.count, 20))),
    difficultyFrom: Math.min(difficultyFrom, difficultyTo),
    difficultyTo: Math.max(difficultyFrom, difficultyTo),
    chapter: text(input.chapter),
    knowledgePoint: text(input.knowledgePoint),
    tags: listFrom(input.tags || input.highFrequencyTags)
  };
}

export function buildWeaknessRows(
  records: Array<{
    mastered: boolean;
    question: {
      subject: QuestionSubject;
      chapter: string;
      knowledgePoint: string;
      difficulty: number;
    };
  }>
) {
  const bucket = new Map<string, { subject: QuestionSubject; chapter: string; knowledgePoint: string; wrong: number; mastered: number; difficultySum: number }>();
  for (const record of records) {
    const key = `${record.question.subject}|${record.question.chapter}|${record.question.knowledgePoint}`;
    const current =
      bucket.get(key) ||
      {
        subject: record.question.subject,
        chapter: record.question.chapter,
        knowledgePoint: record.question.knowledgePoint,
        wrong: 0,
        mastered: 0,
        difficultySum: 0
      };
    current.wrong += 1;
    current.mastered += record.mastered ? 1 : 0;
    current.difficultySum += record.question.difficulty;
    bucket.set(key, current);
  }
  return Array.from(bucket.values())
    .map((item) => ({
      ...item,
      unmastered: item.wrong - item.mastered,
      avgDifficulty: item.wrong ? Math.round((item.difficultySum / item.wrong) * 10) / 10 : 0,
      weaknessScore: item.wrong - item.mastered + item.difficultySum / Math.max(1, item.wrong)
    }))
    .sort((a, b) => b.weaknessScore - a.weaknessScore);
}
