import type {
  ContentReviewAction,
  ContentStatus,
  TeachingContentTemplate,
  TeachingContentType,
  TeachingKeyPoint,
  UserRole
} from "@prisma/client";

export const contentTypeOptions: Array<{ value: TeachingContentType; label: string }> = [
  { value: "COURSE_HANDOUT", label: "课程讲义" },
  { value: "PPT_OUTLINE", label: "PPT 大纲" },
  { value: "REAL_EXAM_ANALYSIS", label: "真题解析" },
  { value: "MOCK_PAPER", label: "模拟试卷" },
  { value: "WRITING_TEMPLATE", label: "作文模板" },
  { value: "INTERVIEW_STRUCTURED_TEMPLATE", label: "面试结构化模板" },
  { value: "SHORT_VIDEO_SCRIPT", label: "短视频脚本" },
  { value: "SALES_MOMENTS_COPY", label: "招生朋友圈文案" },
  { value: "SALES_POSTER_COPY", label: "招生海报文案" }
];

export const contentStatusOptions: Array<{ value: ContentStatus; label: string }> = [
  { value: "DRAFT", label: "草稿" },
  { value: "REVIEWING", label: "待审核" },
  { value: "APPROVED", label: "已通过" },
  { value: "PUBLISHED", label: "已发布" },
  { value: "ARCHIVED", label: "已废弃" }
];

export const teachingContentLabels = {
  type: Object.fromEntries(contentTypeOptions.map((item) => [item.value, item.label])) as Record<
    TeachingContentType,
    string
  >,
  status: Object.fromEntries(contentStatusOptions.map((item) => [item.value, item.label])) as Record<
    ContentStatus,
    string
  >,
  reviewAction: {
    SUBMIT: "提交审核",
    APPROVE: "审核通过",
    REJECT: "驳回",
    ARCHIVE: "废弃"
  } satisfies Record<ContentReviewAction, string>
};

const typeValues = contentTypeOptions.map((item) => item.value);
const reviewActionValues: ContentReviewAction[] = ["SUBMIT", "APPROVE", "REJECT", "ARCHIVE"];

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: unknown) {
  const valueText = text(value);
  return valueText ? valueText : null;
}

function enumOr<T extends string>(value: unknown, values: readonly T[], fallback: T) {
  return typeof value === "string" && values.includes(value as T) ? (value as T) : fallback;
}

export function canManageTeachingContent(role: UserRole) {
  return ["ADMIN", "HQ_OPERATIONS", "ACADEMIC_TEACHER", "LECTURER"].includes(role);
}

export function canReviewTeachingContent(role: UserRole) {
  return ["ADMIN", "HQ_OPERATIONS", "ACADEMIC_TEACHER"].includes(role);
}

export function parseReviewAction(value: unknown): ContentReviewAction {
  if (typeof value === "string" && reviewActionValues.includes(value as ContentReviewAction)) {
    return value as ContentReviewAction;
  }
  throw new Error("审核动作无效，请刷新后重试");
}

export function normalizeContentInput(input: Record<string, unknown>, defaults: { authorId: string }) {
  const title = text(input.title);
  const body = text(input.body);
  if (!title) throw new Error("请输入内容标题");

  return {
    authorId: defaults.authorId,
    title,
    type: enumOr(input.type, typeValues, "COURSE_HANDOUT"),
    category: text(input.category) || "教资培训",
    aiPrompt: nullableText(input.aiPrompt),
    summary: nullableText(input.summary),
    body: body || null
  };
}

export function normalizeTemplateInput(input: Record<string, unknown>) {
  const name = text(input.name);
  const subject = text(input.subject);
  const chapter = text(input.chapter);
  const structureMarkdown = text(input.structureMarkdown);
  if (!name) throw new Error("请输入模板名称");
  if (!subject) throw new Error("请输入适用科目");
  if (!chapter) throw new Error("请输入适用章节");
  if (!structureMarkdown) throw new Error("请输入模板结构 Markdown");

  return {
    name,
    subject,
    chapter,
    type: enumOr(input.type, typeValues, "COURSE_HANDOUT"),
    structureMarkdown,
    enabled: input.enabled !== "false" && input.enabled !== false
  };
}

export function normalizeKeyPointInput(input: Record<string, unknown>) {
  const subject = text(input.subject);
  const chapter = text(input.chapter);
  const name = text(input.name);
  const questionTypes = text(input.questionTypes);
  const direction = text(input.direction);
  const mistakes = text(input.mistakes);
  const keywords = text(input.keywords);
  const frequency = Number(input.frequency || 3);
  if (!subject) throw new Error("请输入科目");
  if (!chapter) throw new Error("请输入章节");
  if (!name) throw new Error("请输入考点名称");
  if (!Number.isInteger(frequency) || frequency < 1 || frequency > 5) throw new Error("高频指数需为 1-5");
  if (!questionTypes) throw new Error("请输入常考题型");
  if (!direction) throw new Error("请输入命题方向");
  if (!mistakes) throw new Error("请输入易错点");
  if (!keywords) throw new Error("请输入关键词");

  return {
    subject,
    chapter,
    name,
    frequency,
    questionTypes,
    direction,
    mistakes,
    keywords,
    note: nullableText(input.note)
  };
}

export function buildTemplateDrivenDraft(input: {
  title: string;
  type: TeachingContentType;
  category: string;
  subject: string;
  chapter: string;
  template: Pick<TeachingContentTemplate, "name" | "structureMarkdown">;
  keyPoints: Array<Pick<TeachingKeyPoint, "name" | "frequency" | "questionTypes" | "direction" | "mistakes" | "keywords" | "note">>;
}) {
  if (input.keyPoints.length === 0) throw new Error("请选择至少一个高频考点");
  const typeLabel = teachingContentLabels.type[input.type];
  const keyPointText = input.keyPoints
    .map((point, index) => [
      `${index + 1}. ${point.name}（高频指数：${point.frequency}/5）`,
      `   - 常考题型：${point.questionTypes}`,
      `   - 命题方向：${point.direction}`,
      `   - 易错点：${point.mistakes}`,
      `   - 关键词：${point.keywords}`,
      point.note ? `   - 备注：${point.note}` : null
    ].filter(Boolean).join("\n"))
    .join("\n");

  return [
    `# ${input.title}`,
    "",
    "## AI 生成约束",
    "- 本初稿必须按照下方模板结构输出，不允许脱离模板自由生成。",
    "- 每个核心段落必须引用至少一个高频考点、命题方向或易错点。",
    "- 未在模板结构和高频考点中出现的信息，只能作为教学衔接补充，不得替代核心内容。",
    "",
    "## 基础信息",
    `- 内容类型：${typeLabel}`,
    `- 内容分类：${input.category}`,
    `- 适用科目：${input.subject}`,
    `- 适用章节：${input.chapter}`,
    `- 使用模板：${input.template.name}`,
    "",
    "## 模板结构 Markdown",
    input.template.structureMarkdown,
    "",
    "## 高频考点与命题依据",
    keyPointText,
    "",
    "## 按模板生成的内容初稿",
    input.template.structureMarkdown,
    "",
    "## 教研审核关注点",
    "- 模板栏目是否完整保留。",
    "- 高频考点、命题方向、易错点是否准确进入正文。",
    "- 是否便于校区老师直接授课、出卷或制作课件。"
  ].join("\n");
}

export function buildAiDraft(input: {
  title: string;
  type: TeachingContentType;
  category: string;
  aiPrompt?: string | null;
}) {
  const typeLabel = teachingContentLabels.type[input.type];
  const prompt = input.aiPrompt || "围绕教师资格证考试培训，突出高频考点、授课结构和可执行练习。";
  return [
    `# ${input.title}`,
    "",
    `类型：${typeLabel}`,
    `分类：${input.category}`,
    "",
    "## 内容目标",
    `- 面向教资培训学员，建立清晰、可交付、可复用的${typeLabel}。`,
    "- 帮助校区老师快速使用统一口径开展教学或招生动作。",
    "",
    "## 核心结构",
    "1. 背景导入：说明本内容适用场景和学员常见问题。",
    "2. 知识框架：拆解关键概念、答题步骤和易错点。",
    "3. 示例演练：提供题目、话术或课堂案例。",
    "4. 复盘任务：给出课后练习、打卡要求或校区执行动作。",
    "",
    "## AI 生成依据",
    prompt,
    "",
    "## 教研审核关注点",
    "- 是否符合教师资格证考试最新题型与评分口径。",
    "- 是否便于校区老师直接使用。",
    "- 是否需要补充真题、模拟题或学员案例。"
  ].join("\n");
}

export function nextStatusByAction(action: ContentReviewAction): ContentStatus {
  if (action === "SUBMIT") return "REVIEWING";
  if (action === "APPROVE") return "APPROVED";
  if (action === "REJECT") return "DRAFT";
  return "ARCHIVED";
}

export function exportFileName(title: string, format: "WORD" | "PDF") {
  const safe = title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 48) || "teaching-content";
  return `${safe}.${format === "WORD" ? "doc" : "pdf"}`;
}

export function renderExportHtml(content: { title: string; body: string | null; summary: string | null }) {
  const body = (content.body || "")
    .split("\n")
    .map((line) => `<p>${escapeHtml(line) || "&nbsp;"}</p>`)
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(content.title)}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.7;padding:40px;color:#17202A}h1{font-size:28px}p{margin:8px 0}</style></head><body><h1>${escapeHtml(content.title)}</h1>${content.summary ? `<p><strong>摘要：</strong>${escapeHtml(content.summary)}</p>` : ""}${body}</body></html>`;
}

export function renderPdfUnavailableHtml(title: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>PDF 导出提示</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.7;padding:40px;color:#17202A}.box{max-width:720px;border:1px solid #E5EAF0;border-radius:8px;padding:24px;background:#fff}h1{font-size:24px;margin-top:0}p{margin:8px 0;color:#5B6776}</style></head><body><main class="box"><h1>教研中心 PDF 导出暂未接入</h1><p>《${escapeHtml(title)}》目前可先使用 Word 导出；PDF 导出需要接入服务端 PDF 渲染能力后启用。</p><p>当前操作没有生成导出记录，也不会影响内容版本。</p></main></body></html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
