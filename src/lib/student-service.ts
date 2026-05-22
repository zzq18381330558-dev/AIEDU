import type {
  AttendanceStatus,
  CourseSessionType,
  LeadExamTrack,
  Prisma,
  ReminderType,
  ServiceTicketStatus,
  StudentStudyStatus,
  UserRole
} from "@prisma/client";

export const studyStatusOptions: Array<{ value: StudentStudyStatus; label: string }> = [
  { value: "NOT_STARTED", label: "未开学" },
  { value: "STUDYING", label: "学习中" },
  { value: "LOW_ACTIVE", label: "低活跃" },
  { value: "SPRINT", label: "冲刺期" },
  { value: "INTERVIEW_STAGE", label: "面试阶段" },
  { value: "PAUSED", label: "暂停" },
  { value: "COMPLETED", label: "已结课" },
  { value: "REFUNDED", label: "已退费" }
];

export const sessionTypeOptions: Array<{ value: CourseSessionType; label: string }> = [
  { value: "LIVE", label: "直播课" },
  { value: "RECORDED", label: "录播课" },
  { value: "PRACTICE", label: "练习课" },
  { value: "MOCK_EXAM", label: "模考" }
];

export const attendanceStatusOptions: Array<{ value: AttendanceStatus; label: string }> = [
  { value: "PRESENT", label: "已到课" },
  { value: "LATE", label: "迟到" },
  { value: "ABSENT", label: "缺课" },
  { value: "LEAVE", label: "请假" }
];

export const reminderTypeOptions: Array<{ value: ReminderType; label: string }> = [
  { value: "CLASS", label: "上课提醒" },
  { value: "HOMEWORK", label: "作业提醒" },
  { value: "CHECK_IN", label: "打卡提醒" },
  { value: "ABSENCE", label: "缺课提醒" },
  { value: "EXAM", label: "考试节点" },
  { value: "STUDY_PLAN", label: "学习计划" }
];

export const serviceTicketStatusOptions: Array<{ value: ServiceTicketStatus; label: string }> = [
  { value: "OPEN", label: "待处理" },
  { value: "IN_PROGRESS", label: "跟进中" },
  { value: "RESOLVED", label: "已解决" },
  { value: "CLOSED", label: "已关闭" }
];

export const studentServiceLabels = {
  studyStatus: Object.fromEntries(studyStatusOptions.map((item) => [item.value, item.label])) as Record<
    StudentStudyStatus,
    string
  >,
  sessionType: Object.fromEntries(sessionTypeOptions.map((item) => [item.value, item.label])) as Record<
    CourseSessionType,
    string
  >,
  attendanceStatus: Object.fromEntries(attendanceStatusOptions.map((item) => [item.value, item.label])) as Record<
    AttendanceStatus,
    string
  >,
  reminderType: Object.fromEntries(reminderTypeOptions.map((item) => [item.value, item.label])) as Record<
    ReminderType,
    string
  >,
  serviceTicketStatus: Object.fromEntries(serviceTicketStatusOptions.map((item) => [item.value, item.label])) as Record<
    ServiceTicketStatus,
    string
  >,
  examTrack: {
    INFANT: "幼儿",
    PRIMARY: "小学",
    MIDDLE: "中学"
  } satisfies Record<LeadExamTrack, string>
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeStudentStatusInput(input: Record<string, unknown>) {
  return {
    studyStatus: enumOr(
      input.studyStatus,
      studyStatusOptions.map((item) => item.value),
      "STUDYING"
    ),
    serviceNote: nullableText(input.serviceNote)
  } satisfies Prisma.StudentUncheckedUpdateInput;
}

export function normalizeServiceRecordInput(input: Record<string, unknown>) {
  const title = text(input.title);
  const content = text(input.content);
  if (!title) throw new Error("请输入服务记录标题");
  if (!content) throw new Error("请输入服务记录内容");
  return {
    title,
    content,
    status: enumOr(
      input.status,
      serviceTicketStatusOptions.map((item) => item.value),
      "OPEN"
    )
  };
}

export function normalizeAttendanceInput(input: Record<string, unknown>) {
  const status = enumOr(
    input.status,
    attendanceStatusOptions.map((item) => item.value),
    "PRESENT"
  );
  const inputCheckInAt = nullableDate(input.checkInAt);
  if (text(input.checkInAt) && !inputCheckInAt) throw new Error("请选择有效打卡时间");

  return {
    status,
    checkInAt: inputCheckInAt || (status === "PRESENT" || status === "LATE" ? new Date() : null),
    note: nullableText(input.note)
  } satisfies Pick<Prisma.AttendanceRecordUncheckedCreateInput, "status" | "checkInAt" | "note">;
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

function enumOr<T extends string>(value: unknown, values: readonly T[], fallback: T) {
  return typeof value === "string" && values.includes(value as T) ? (value as T) : fallback;
}

export function studentScopeWhere(user: { id: string; role: UserRole; campusId: string | null }) {
  if (user.role === "ADMIN" || user.role === "HQ_OPERATIONS") return {};
  if (user.role === "CAMPUS_MANAGER" || user.role === "ACADEMIC_TEACHER") {
    return user.campusId ? { campusId: user.campusId } : { id: "__none__" };
  }
  if (user.role === "ADMISSIONS_COUNSELOR") return { salesOwnerId: user.id };
  return { id: "__none__" };
}

export function classScopeWhere(user: { role: UserRole; campusId: string | null }) {
  if (user.role === "ADMIN" || user.role === "HQ_OPERATIONS") return {};
  return user.campusId ? { campusId: user.campusId } : { id: "__none__" };
}

export function normalizeStudentInput(input: Record<string, unknown>, defaults: { campusId: string }) {
  const name = text(input.name);
  const phone = text(input.phone).replace(/\s/g, "");
  const campusId = text(input.campusId) || defaults.campusId;
  if (!name) throw new Error("请输入学员姓名");
  if (!phone) throw new Error("请输入手机号");
  if (!campusId) throw new Error("请选择校区");

  return {
    campusId,
    classId: nullableText(input.classId),
    academicOwnerId: nullableText(input.academicOwnerId),
    salesOwnerId: nullableText(input.salesOwnerId),
    name,
    phone,
    school: nullableText(input.school),
    grade: nullableText(input.grade),
    major: nullableText(input.major),
    classType: nullableText(input.classType),
    examTrack: enumOr(input.examTrack, ["INFANT", "PRIMARY", "MIDDLE"] as const, "PRIMARY"),
    studyStatus: enumOr(
      input.studyStatus,
      studyStatusOptions.map((item) => item.value),
      "NOT_STARTED"
    ),
    serviceNote: nullableText(input.serviceNote)
  } satisfies Prisma.StudentUncheckedCreateInput;
}

export function normalizeClassInput(input: Record<string, unknown>, defaults: { campusId: string }) {
  const name = text(input.name);
  const campusId = text(input.campusId) || defaults.campusId;
  const startAt = nullableDate(input.startAt);
  if (!name) throw new Error("请输入班级名称");
  if (!campusId) throw new Error("请选择校区");
  if (!startAt) throw new Error("请选择开课时间");

  return {
    campusId,
    name,
    startAt,
    academicOwnerId: nullableText(input.academicOwnerId),
    lecturerId: nullableText(input.lecturerId),
    classType: nullableText(input.classType),
    examTrack: enumOr(input.examTrack, ["INFANT", "PRIMARY", "MIDDLE"] as const, "PRIMARY")
  } satisfies Prisma.StudentClassUncheckedCreateInput;
}

export function normalizeSessionInput(input: Record<string, unknown>, defaults: { campusId: string }) {
  const title = text(input.title);
  const startsAt = nullableDate(input.startsAt);
  const endsAt = nullableDate(input.endsAt);
  const classId = text(input.classId);
  const campusId = text(input.campusId) || defaults.campusId;
  if (!title) throw new Error("请输入课程标题");
  if (!classId) throw new Error("请选择班级");
  if (!campusId) throw new Error("请选择校区");
  if (!startsAt || !endsAt) throw new Error("请选择上课时间");

  return {
    campusId,
    classId,
    lecturerId: nullableText(input.lecturerId),
    title,
    type: enumOr(input.type, sessionTypeOptions.map((item) => item.value), "LIVE"),
    startsAt,
    endsAt,
    room: nullableText(input.room),
    homework: nullableText(input.homework)
  } satisfies Prisma.CourseSessionUncheckedCreateInput;
}

export function buildAiStudyPlan(student: {
  name: string;
  school: string | null;
  grade: string | null;
  major: string | null;
  classType: string | null;
  examTrack: LeadExamTrack;
  studyStatus: StudentStudyStatus;
}) {
  const track = studentServiceLabels.examTrack[student.examTrack];
  const base = `${student.name}，${student.school || "在校大学生"}${student.grade ? `，${student.grade}` : ""}${
    student.major ? `，${student.major}` : ""
  }，报考${track}教师资格证。`;

  return [
    `${base}`,
    "第 1 周：完成综合素质基础诊断，建立每日 30 分钟打卡节奏。",
    "第 2-3 周：集中学习教育知识核心章节，每周完成 2 套章节练习。",
    "第 4 周：进入真题训练，错题按知识点归档，教务每周复盘一次。",
    "考前 14 天：每天 1 套模拟卷，重点跟踪作文、材料分析和薄弱题型。",
    "服务动作：上课前 2 小时提醒，作业截止前 24 小时提醒，连续 2 次未打卡触发教务关怀。"
  ].join("\n");
}

export function buildServiceScript(student: {
  name: string;
  examTrack: LeadExamTrack;
  studyStatus: StudentStudyStatus;
  serviceNote: string | null;
}) {
  const track = studentServiceLabels.examTrack[student.examTrack];
  return [
    `${student.name}同学你好，我是你的教务老师。今天帮你同步一下${track}教资备考安排。`,
    "这周我们先把上课、作业和打卡节奏稳定下来，我会在关键节点提前提醒你。",
    "如果你哪天课程或作业有冲突，直接告诉我，我会帮你调整学习计划。",
    student.serviceNote ? `我也注意到你的服务备注：${student.serviceNote}，后面会重点跟进。` : "后续我会根据你的打卡和作业情况，给你更新更细的复习建议。"
  ].join("\n");
}

export function buildReservedPushPayload(input: {
  title: string;
  content: string;
  receiver?: string | null;
  channel?: string;
}) {
  return {
    provider: "OPENCLAW_RESERVED",
    channel: input.channel || "ENTERPRISE_WECHAT_RESERVED",
    receiver: input.receiver || null,
    payload: {
      title: input.title,
      content: input.content
    },
    ready: false
  };
}
