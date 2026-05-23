import type {
  PaperStatus,
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

export const paperTypeOptions = [
  { value: "REAL_EXAM", label: "真题卷" },
  { value: "MOCK", label: "模拟卷" },
  { value: "SPECIAL", label: "专项卷" }
] as const;

export const paperDifficultyOptions = [
  { value: "EASY", label: "简单" },
  { value: "MEDIUM", label: "中等" },
  { value: "HARD", label: "困难" }
] as const;

export const paperStageOptions = [
  { value: "INFANT", label: "幼儿" },
  { value: "PRIMARY", label: "小学" },
  { value: "MIDDLE", label: "中学" }
] as const;

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
  >,
  paperType: Object.fromEntries(paperTypeOptions.map((item) => [item.value, item.label])) as Record<
    (typeof paperTypeOptions)[number]["value"],
    string
  >,
  paperDifficulty: Object.fromEntries(paperDifficultyOptions.map((item) => [item.value, item.label])) as Record<
    (typeof paperDifficultyOptions)[number]["value"],
    string
  >,
  paperStage: Object.fromEntries(paperStageOptions.map((item) => [item.value, item.label])) as Record<
    (typeof paperStageOptions)[number]["value"],
    string
  >
};

const subjectValues = subjectOptions.map((item) => item.value);
const typeValues = questionTypeOptions.map((item) => item.value);
const sourceValues = questionSourceOptions.map((item) => item.value);
const paperTypeValues = paperTypeOptions.map((item) => item.value);
const paperDifficultyValues = paperDifficultyOptions.map((item) => item.value);
const paperStageValues = paperStageOptions.map((item) => item.value);
const paperStatusValues: PaperStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

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
  return ["ADMIN", "ACADEMIC_TEACHER", "LECTURER"].includes(role);
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
    paperId: nullableText(input.paperId),
    questionNo: nullableText(input.questionNo),
    score: input.score ? numberOr(input.score, 0) : null,
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

export function normalizePaperInput(input: Record<string, unknown>) {
  const title = text(input.name || input.title);
  if (!title) throw new Error("请输入试卷名称");

  return {
    questionBankId: nullableText(input.questionBankId),
    title,
    paperType: enumOr(input.paperType || input.type, paperTypeValues, "MOCK"),
    subject: enumOr(input.subject, subjectValues, "COMPREHENSIVE_QUALITY"),
    stage: optionalEnum(input.stage, paperStageValues) ?? null,
    year: input.year ? numberOr(input.year, new Date().getFullYear()) : null,
    region: nullableText(input.region),
    source: nullableText(input.source),
    totalScore: Math.max(0, numberOr(input.totalScore, 100)),
    durationMinutes: Math.max(0, numberOr(input.duration || input.durationMinutes, 120)),
    questionCount: Math.max(0, numberOr(input.questionCount, 0)),
    difficulty: enumOr(input.difficulty, paperDifficultyValues, "MEDIUM"),
    description: nullableText(input.description),
    status: enumOr(input.status, paperStatusValues, "DRAFT")
  } satisfies Prisma.ExamPaperUncheckedCreateInput;
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

export const questionImportHeaders = [
  "科目",
  "章节",
  "知识点",
  "题型",
  "题干",
  "选项",
  "正确答案",
  "解析",
  "难度",
  "高频标签",
  "来源",
  "年份"
] as const;

export const questionImportRequiredHeaders = ["题干", "正确答案"] as const;

export const paperQuestionImportHeaders = [
  "题号",
  "题型",
  "题目",
  "选项A",
  "选项B",
  "选项C",
  "选项D",
  "正确答案",
  "解析",
  "难度",
  "考点",
  "分值"
] as const;

export const paperQuestionImportRequiredHeaders = ["题号", "题型", "题目", "正确答案"] as const;

export function normalizeImportQuestionRow(row: Record<string, unknown>) {
  const map: Record<(typeof questionImportHeaders)[number], string> = {
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

export function validateImportHeaders(headers: string[], requiredHeaders: readonly string[]) {
  const missing = requiredHeaders.filter((header) => !headers.includes(header));
  if (missing.length) {
    throw new Error(`导入文件缺少关键列：${missing.join("、")}。请下载模板后按表头填写。`);
  }
}

function questionTypeFromLabel(value: unknown) {
  const raw = text(value);
  const aliases: Record<string, QuestionType> = {
    单选: "SINGLE_CHOICE",
    单项选择: "SINGLE_CHOICE",
    单选题: "SINGLE_CHOICE",
    材料分析: "MATERIAL_ANALYSIS",
    材料分析题: "MATERIAL_ANALYSIS",
    作文: "WRITING",
    写作: "WRITING",
    简答: "SHORT_ANSWER",
    简答题: "SHORT_ANSWER",
    辨析: "DISCRIMINATION",
    辨析题: "DISCRIMINATION",
    案例分析: "CASE_ANALYSIS",
    案例分析题: "CASE_ANALYSIS"
  };
  return enumOr(raw, typeValues, aliases[raw] || ("" as QuestionType));
}

function difficultyFromLabel(value: unknown) {
  const raw = text(value);
  const aliases: Record<string, number> = {
    简单: 1,
    易: 1,
    中等: 3,
    中: 3,
    困难: 5,
    难: 5
  };
  return aliases[raw] || Math.min(5, Math.max(1, numberOr(raw, 3)));
}

function optionsFromColumns(row: Record<string, unknown>) {
  const options = ["A", "B", "C", "D"]
    .map((key) => ({ key, text: text(row[`选项${key}`]) }))
    .filter((item) => item.text);
  return options.length ? options.map((item) => `${item.key}. ${item.text}`).join("\n") : "";
}

export function normalizePaperQuestionImportRow(
  row: Record<string, unknown>,
  defaults: {
    paperId: string;
    subject: QuestionSubject;
    year: number | null;
    source: QuestionSource;
  }
) {
  const questionNo = text(row["题号"]);
  const type = questionTypeFromLabel(row["题型"]);
  const stem = text(row["题目"]);
  const answer = text(row["正确答案"]);

  if (!questionNo) throw new Error("题号不能为空");
  if (!type) throw new Error(`题型“${text(row["题型"]) || "空"}”无效，请使用：${questionTypeOptions.map((item) => item.label).join("、")}`);
  if (!stem) throw new Error("题目不能为空");
  if (!answer) throw new Error("正确答案不能为空");

  return normalizeQuestionInput({
    paperId: defaults.paperId,
    questionNo,
    score: row["分值"] ? numberOr(row["分值"], 0) : 0,
    subject: defaults.subject,
    chapter: "成套试卷",
    knowledgePoint: text(row["考点"]) || "未分类知识点",
    type,
    stem,
    options: optionsFromColumns(row),
    answer,
    analysis: row["解析"],
    difficulty: difficultyFromLabel(row["难度"]),
    highFrequencyTags: row["考点"],
    source: defaults.source,
    year: defaults.year
  });
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
