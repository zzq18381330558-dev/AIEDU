import type { Prisma, SopCategory, SopStatus, SopTaskStatus, UserRole } from "@prisma/client";

export const sopCategoryOptions: Array<{ value: SopCategory; label: string; group: string }> = [
  { value: "NEW_CAMPUS_LAUNCH", label: "新校区启动", group: "开办复制" },
  { value: "UNIVERSITY_COOPERATION", label: "高校合作", group: "渠道建设" },
  { value: "GROUND_PROMOTION", label: "招生地推", group: "招生 SOP" },
  { value: "MOMENTS_OPERATION", label: "朋友圈运营", group: "招生 SOP" },
  { value: "CONSULTATION_CONVERSION", label: "咨询转化", group: "招生 SOP" },
  { value: "STUDENT_ONBOARDING", label: "学员入学", group: "教务 SOP" },
  { value: "CLASS_SERVICE", label: "上课服务", group: "教务 SOP" },
  { value: "CHECK_IN_SUPERVISION", label: "打卡督学", group: "教务 SOP" },
  { value: "EXAM_SPRINT", label: "考前冲刺", group: "教务 SOP" },
  { value: "INTERVIEW_SERVICE", label: "面试服务", group: "教务 SOP" },
  { value: "REFUND_COMPLAINT", label: "退费与投诉", group: "风控服务" }
];

export const sopStatusOptions: Array<{ value: SopStatus; label: string }> = [
  { value: "DRAFT", label: "草稿" },
  { value: "ACTIVE", label: "启用" },
  { value: "RETIRED", label: "停用" }
];

export const sopTaskStatusOptions: Array<{ value: SopTaskStatus; label: string }> = [
  { value: "TODO", label: "待处理" },
  { value: "IN_PROGRESS", label: "进行中" },
  { value: "DONE", label: "已完成" },
  { value: "BLOCKED", label: "阻塞" }
];

export const sopLabels = {
  category: Object.fromEntries(sopCategoryOptions.map((item) => [item.value, item.label])) as Record<
    SopCategory,
    string
  >,
  categoryGroup: Object.fromEntries(sopCategoryOptions.map((item) => [item.value, item.group])) as Record<
    SopCategory,
    string
  >,
  status: Object.fromEntries(sopStatusOptions.map((item) => [item.value, item.label])) as Record<SopStatus, string>,
  taskStatus: Object.fromEntries(sopTaskStatusOptions.map((item) => [item.value, item.label])) as Record<
    SopTaskStatus,
    string
  >
};

const categoryValues = sopCategoryOptions.map((item) => item.value);
const statusValues = sopStatusOptions.map((item) => item.value);
const taskStatusValues = sopTaskStatusOptions.map((item) => item.value);

export function isSopCategory(value: unknown): value is SopCategory {
  return typeof value === "string" && categoryValues.includes(value as SopCategory);
}

export function isSopStatus(value: unknown): value is SopStatus {
  return typeof value === "string" && statusValues.includes(value as SopStatus);
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: unknown) {
  const valueText = text(value);
  return valueText ? valueText : null;
}

function nullableDate(value: unknown) {
  const valueText = text(value);
  if (!valueText) return null;
  const date = new Date(valueText);
  return Number.isNaN(date.getTime()) ? null : date;
}

function numberOr(value: unknown, fallback: number) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function enumOr<T extends string>(value: unknown, values: readonly T[], fallback: T) {
  return typeof value === "string" && values.includes(value as T) ? (value as T) : fallback;
}

export function canManageSop(role: UserRole) {
  return role === "ADMIN" || role === "HQ_OPERATIONS";
}

export function canInspectSop(role: UserRole) {
  return role === "ADMIN" || role === "HQ_OPERATIONS";
}

export function sopCampusWhere(user: { role: UserRole; campusId: string | null; organizationId: string }) {
  if (user.role === "ADMIN" || user.role === "HQ_OPERATIONS") return { organizationId: user.organizationId };
  return user.campusId ? { id: user.campusId } : { id: "__none__" };
}

export function sopTaskScopeWhere(user: {
  role: UserRole;
  campusId: string | null;
  organizationId: string;
}): Prisma.SopTaskWhereInput {
  if (user.role === "ADMIN" || user.role === "HQ_OPERATIONS") {
    return { campus: { organizationId: user.organizationId } };
  }
  return user.campusId ? { campusId: user.campusId } : { id: "__none__" };
}

export function sopExecutionScopeWhere(user: {
  role: UserRole;
  campusId: string | null;
  organizationId: string;
}): Prisma.SopExecutionWhereInput {
  if (user.role === "ADMIN" || user.role === "HQ_OPERATIONS") {
    return { campus: { organizationId: user.organizationId } };
  }
  return user.campusId ? { campusId: user.campusId } : { id: "__none__" };
}

export function normalizeSopTemplateInput(input: Record<string, unknown>) {
  const title = text(input.title);
  if (!title) throw new Error("请输入 SOP 标题");
  return {
    title,
    module: text(input.module) || sopLabels.categoryGroup[enumOr(input.category, categoryValues, "NEW_CAMPUS_LAUNCH")],
    category: enumOr(input.category, categoryValues, "NEW_CAMPUS_LAUNCH"),
    status: enumOr(input.status, statusValues, "ACTIVE"),
    version: Math.max(1, numberOr(input.version, 1)),
    summary: nullableText(input.summary),
    document: nullableText(input.document)
  } satisfies Prisma.SopTemplateUncheckedCreateInput;
}

export function parseStepLines(value: unknown) {
  return text(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [titlePart, standardPart] = line.split("|").map((item) => item.trim());
      return {
        title: titlePart.replace(/^\d+[.、]\s*/, ""),
        standard: standardPart || null,
        sortOrder: index + 1
      };
    });
}

export function normalizeSopExecutionInput(input: Record<string, unknown>) {
  const campusId = text(input.campusId);
  const owner = text(input.owner);
  if (!campusId) throw new Error("请选择执行校区");
  if (!owner) throw new Error("请输入责任人");
  return { campusId, owner };
}

export function normalizeSopTaskInput(input: Record<string, unknown>, defaults: { sopTemplateId: string }) {
  const title = text(input.title);
  const campusId = text(input.campusId);
  if (!title) throw new Error("请输入任务标题");
  if (!campusId) throw new Error("请选择校区");
  return {
    sopTemplateId: defaults.sopTemplateId,
    sopExecutionId: nullableText(input.sopExecutionId),
    campusId,
    title,
    description: nullableText(input.description),
    status: enumOr(input.status, taskStatusValues, "TODO"),
    dueDate: nullableDate(input.dueDate)
  } satisfies Prisma.SopTaskUncheckedCreateInput;
}

export function normalizeSopTaskUpdateInput(input: Record<string, unknown>) {
  const title = text(input.title);
  if (!title) throw new Error("请输入任务标题");
  return {
    title,
    description: nullableText(input.description),
    status: enumOr(input.status, taskStatusValues, "TODO"),
    dueDate: nullableDate(input.dueDate),
    completedAt: enumOr(input.status, taskStatusValues, "TODO") === "DONE" ? new Date() : null
  } satisfies Prisma.SopTaskUncheckedUpdateInput;
}

export function normalizeSopCheckInInput(input: Record<string, unknown>) {
  const note = text(input.note);
  if (!note) throw new Error("请输入打卡说明");
  return {
    note,
    evidence: nullableText(input.evidence),
    status: enumOr(input.status, taskStatusValues, "IN_PROGRESS")
  };
}

export function normalizeSopInspectionInput(input: Record<string, unknown>) {
  const score = Math.min(100, Math.max(0, numberOr(input.score, 80)));
  return {
    sopExecutionId: nullableText(input.sopExecutionId),
    score,
    checklist: {
      documentReady: Boolean(input.documentReady),
      taskTraceable: Boolean(input.taskTraceable),
      dataReviewed: Boolean(input.dataReviewed),
      campusFeedback: Boolean(input.campusFeedback)
    } as Prisma.InputJsonValue,
    comment: nullableText(input.comment)
  };
}

export function normalizeSopWeeklyReportInput(input: Record<string, unknown>) {
  const campusId = text(input.campusId);
  const summary = text(input.summary);
  if (!campusId) throw new Error("请选择校区");
  if (!summary) throw new Error("请输入周报总结");
  const weekStart = nullableDate(input.weekStart) || startOfWeek(new Date());
  return {
    sopExecutionId: nullableText(input.sopExecutionId),
    campusId,
    weekStart,
    summary,
    blockers: nullableText(input.blockers),
    nextPlan: nullableText(input.nextPlan),
    metrics: {
      leadCount: numberOr(input.leadCount, 0),
      consultCount: numberOr(input.consultCount, 0),
      classCount: numberOr(input.classCount, 0),
      riskCount: numberOr(input.riskCount, 0)
    } as Prisma.InputJsonValue
  };
}

export function computeCompletionRate(done: number, total: number) {
  return total ? Math.round((done / total) * 1000) / 10 : 0;
}

export function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay() || 7;
  next.setDate(next.getDate() - day + 1);
  next.setHours(0, 0, 0, 0);
  return next;
}
