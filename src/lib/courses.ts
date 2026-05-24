import type { CourseStatus, LeadExamTrack, Prisma, UserRole } from "@prisma/client";

export const courseStatusOptions: Array<{ value: CourseStatus; label: string }> = [
  { value: "ACTIVE", label: "启用" },
  { value: "DISABLED", label: "停用" }
];

export const courseLabels = {
  status: {
    ACTIVE: "启用",
    DISABLED: "停用"
  } satisfies Record<CourseStatus, string>,
  examTrack: {
    INFANT: "幼儿",
    PRIMARY: "小学",
    MIDDLE: "中学"
  } satisfies Record<LeadExamTrack, string>
};

export const courseInclude = {
  campus: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true, phone: true } },
  chapters: {
    include: {
      lessons: {
        include: {
          teachingContent: { select: { id: true, title: true } },
          questionPaper: { select: { id: true, title: true } }
        },
        orderBy: { sortOrder: "asc" as const }
      }
    },
    orderBy: { sortOrder: "asc" as const }
  },
  _count: { select: { classes: true, chapters: true } }
} satisfies Prisma.CourseInclude;

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

function intOr(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : fallback;
}

export function canManageCourse(role: UserRole) {
  return role === "ADMIN" || role === "CAMPUS_MANAGER";
}

export function normalizeCourseInput(input: Record<string, unknown>, defaults: { organizationId: string; createdById: string }) {
  const name = text(input.name);
  const code = text(input.code).toUpperCase();
  const category = text(input.category);
  if (!name) throw new Error("请输入课程名称");
  if (!code) throw new Error("请输入课程编码");
  if (!category) throw new Error("请输入课程分类");

  return {
    organizationId: defaults.organizationId,
    campusId: nullableText(input.campusId),
    createdById: defaults.createdById,
    name,
    code,
    description: nullableText(input.description),
    examTrack: enumOr(input.examTrack, ["INFANT", "PRIMARY", "MIDDLE"] as const, "PRIMARY"),
    category,
    price: Number(input.price || 0),
    status: enumOr(input.status, courseStatusOptions.map((item) => item.value), "ACTIVE"),
    isPublished: input.isPublished === true || input.isPublished === "true" || input.isPublished === "on"
  } satisfies Prisma.CourseUncheckedCreateInput;
}

export function normalizeCourseUpdateInput(input: Record<string, unknown>) {
  const createInput = normalizeCourseInput(input, { organizationId: "__placeholder__", createdById: "__placeholder__" });
  return {
    campusId: createInput.campusId,
    name: createInput.name,
    code: createInput.code,
    description: createInput.description,
    examTrack: createInput.examTrack,
    category: createInput.category,
    price: createInput.price,
    status: createInput.status,
    isPublished: createInput.isPublished
  } satisfies Prisma.CourseUncheckedUpdateInput;
}

export function normalizeChapterInput(input: Record<string, unknown>) {
  const title = text(input.title);
  if (!title) throw new Error("请输入章节标题");
  return {
    title,
    description: nullableText(input.description),
    sortOrder: intOr(input.sortOrder)
  } satisfies Pick<Prisma.CourseChapterUncheckedCreateInput, "title" | "description" | "sortOrder">;
}

export function normalizeChapterUpdateInput(input: Record<string, unknown>) {
  return normalizeChapterInput(input) satisfies Prisma.CourseChapterUncheckedUpdateInput;
}

export function normalizeLessonInput(input: Record<string, unknown>, defaults: { chapterId?: string } = {}) {
  const title = text(input.title);
  const chapterId = text(input.chapterId) || defaults.chapterId || "";
  if (!chapterId) throw new Error("请选择所属章节");
  if (!title) throw new Error("请输入课时标题");
  return {
    chapterId,
    title,
    summary: nullableText(input.summary),
    durationMinutes: intOr(input.durationMinutes),
    sortOrder: intOr(input.sortOrder),
    teachingContentId: nullableText(input.teachingContentId),
    questionPaperId: nullableText(input.questionPaperId)
  } satisfies Prisma.CourseLessonUncheckedCreateInput;
}

export function normalizeLessonUpdateInput(input: Record<string, unknown>) {
  const lesson = normalizeLessonInput(input, { chapterId: "__placeholder__" });
  return {
    title: lesson.title,
    summary: lesson.summary,
    durationMinutes: lesson.durationMinutes,
    sortOrder: lesson.sortOrder,
    teachingContentId: lesson.teachingContentId,
    questionPaperId: lesson.questionPaperId
  } satisfies Prisma.CourseLessonUncheckedUpdateInput;
}

export function toCourseDto<T extends { deletedAt?: Date | null }>(course: T) {
  const { deletedAt, ...rest } = course;
  return { ...rest, deleted: Boolean(deletedAt) };
}
