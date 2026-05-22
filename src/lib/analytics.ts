import type {
  AttendanceStatus,
  LeadSourceChannel,
  LeadStatus,
  Prisma,
  QuestionSubject,
  UserRole
} from "@prisma/client";
import { crmLabels } from "@/lib/crm";
import { buildWeaknessRows } from "@/lib/question-bank";

export type AnalyticsFilters = {
  from: Date;
  to: Date;
  campusId?: string;
  assigneeId?: string;
};

export type AnalyticsInput = {
  leads: Array<{
    id: string;
    campusId: string;
    assigneeId: string | null;
    sourceChannel: LeadSourceChannel;
    status: LeadStatus;
    createdAt: Date;
    campus?: { name: string } | null;
    assignee?: { name: string } | null;
  }>;
  students: Array<{
    id: string;
    campusId: string;
    classId: string | null;
    salesOwnerId: string | null;
    studyStatus: string;
    enrolledAt: Date;
    campus?: { name: string } | null;
    class?: { name: string } | null;
    salesOwner?: { name: string } | null;
  }>;
  attendance: Array<{
    status: AttendanceStatus;
    studentId: string;
    checkInAt: Date | null;
    courseSession?: { homework: string | null; class?: { id: string; name: string } | null } | null;
  }>;
  courseSessions: Array<{
    startsAt: Date;
    endsAt: Date;
  }>;
  wrongQuestionRecords: Array<{
    mastered: boolean;
    question: {
      subject: QuestionSubject;
      chapter: string;
      knowledgePoint: string;
      difficulty: number;
    };
  }>;
};

export const financeDefaults = {
  tuitionPerStudent: 2980,
  universityShareRate: 0.18,
  teacherFeePerClassHour: 220,
  hoursPerClass: 2,
  campusFixedCostRate: 0.32,
  refundRateFallback: 0.03
};

function pct(numerator: number, denominator: number) {
  return denominator ? Math.round((numerator / denominator) * 1000) / 10 : 0;
}

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function parseAnalyticsFilters(searchParams: URLSearchParams, now = new Date()): AnalyticsFilters {
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 29);
  const from = searchParams.get("from") ? new Date(String(searchParams.get("from"))) : defaultFrom;
  const to = searchParams.get("to") ? new Date(String(searchParams.get("to"))) : now;
  to.setHours(23, 59, 59, 999);
  return {
    from,
    to,
    campusId: searchParams.get("campusId") || undefined,
    assigneeId: searchParams.get("assigneeId") || undefined
  };
}

export function buildAnalyticsWhere(
  user: { id: string; role: UserRole; campusId: string | null },
  filters: AnalyticsFilters
) {
  const leadWhere: Prisma.LeadWhereInput = { createdAt: { gte: filters.from, lte: filters.to } };
  const studentWhere: Prisma.StudentWhereInput = { enrolledAt: { gte: filters.from, lte: filters.to } };
  const attendanceWhere: Prisma.AttendanceRecordWhereInput = {
    courseSession: { startsAt: { gte: filters.from, lte: filters.to } }
  };

  if (user.role === "CAMPUS_MANAGER" && user.campusId) {
    leadWhere.campusId = user.campusId;
    studentWhere.campusId = user.campusId;
    attendanceWhere.student = { campusId: user.campusId };
  }
  if (filters.campusId) {
    leadWhere.campusId = filters.campusId;
    studentWhere.campusId = filters.campusId;
    attendanceWhere.student = { ...(attendanceWhere.student as object), campusId: filters.campusId };
  }
  if (filters.assigneeId) {
    leadWhere.assigneeId = filters.assigneeId;
    studentWhere.salesOwnerId = filters.assigneeId;
    attendanceWhere.student = { ...(attendanceWhere.student as object), salesOwnerId: filters.assigneeId };
  }
  return { leadWhere, studentWhere, attendanceWhere };
}

export function buildCourseSessionWhere(
  user: { role: UserRole; campusId: string | null; organizationId: string },
  filters: AnalyticsFilters
): Prisma.CourseSessionWhereInput {
  const where: Prisma.CourseSessionWhereInput = { startsAt: { gte: filters.from, lte: filters.to } };
  if (filters.campusId) {
    where.campusId = filters.campusId;
  } else if (user.role === "ADMIN" || user.role === "HQ_OPERATIONS") {
    where.campus = { organizationId: user.organizationId };
  } else if (user.campusId) {
    where.campusId = user.campusId;
  } else {
    where.id = "__none__";
  }
  if (filters.assigneeId) {
    where.class = { students: { some: { salesOwnerId: filters.assigneeId } } };
  }
  return where;
}

export function buildWrongQuestionWhere(
  user: { role: UserRole; campusId: string | null },
  filters: AnalyticsFilters
): Prisma.WrongQuestionRecordWhereInput {
  const where: Prisma.WrongQuestionRecordWhereInput = { wrongAt: { gte: filters.from, lte: filters.to } };
  if (user.role === "CAMPUS_MANAGER" && user.campusId) {
    where.student = { campusId: user.campusId };
  }
  if (filters.campusId) {
    where.student = { ...(where.student as object), campusId: filters.campusId };
  }
  if (filters.assigneeId) {
    where.student = { ...(where.student as object), salesOwnerId: filters.assigneeId };
  }
  return where;
}

export function computeAnalytics(input: AnalyticsInput) {
  const leads = input.leads;
  const students = input.students;
  const attendance = input.attendance;

  const newLeadCount = leads.length;
  const effectiveConsultCount = leads.filter((lead) => lead.status !== "UNCONTACTED").length;
  const wonLeadCount = leads.filter((lead) => lead.status === "WON").length;
  const refundCount = students.filter((student) => student.studyStatus === "REFUNDED").length;
  const conversionRate = pct(wonLeadCount, newLeadCount);
  const attendanceCount = attendance.length;
  const presentCount = attendance.filter((item) => item.status === "PRESENT" || item.status === "LATE").length;
  const checkInCount = attendance.filter((item) => Boolean(item.checkInAt)).length;
  const absentCount = attendance.filter((item) => item.status === "ABSENT").length;
  const homeworkSessions = attendance.filter((item) => Boolean(item.courseSession?.homework)).length;
  const homeworkCompleted = attendance.filter((item) => Boolean(item.courseSession?.homework) && item.status !== "ABSENT").length;
  const classHourCount = input.courseSessions.reduce((sum, session) => {
    const hours = (session.endsAt.getTime() - session.startsAt.getTime()) / 1000 / 60 / 60;
    return sum + Math.max(0, hours);
  }, 0);
  const weakKnowledgeRows = buildWeaknessRows(input.wrongQuestionRecords).slice(0, 8);

  const revenue = wonLeadCount * financeDefaults.tuitionPerStudent;
  const universityShare = revenue * financeDefaults.universityShareRate;
  const teacherFee = classHourCount * financeDefaults.teacherFeePerClassHour;
  const refundAmount = revenue * (refundCount ? refundCount / Math.max(1, students.length) : financeDefaults.refundRateFallback);
  const campusFixedCost = revenue * financeDefaults.campusFixedCostRate;
  const profit = revenue - universityShare - teacherFee - refundAmount - campusFixedCost;

  return {
    overview: {
      newLeadCount,
      effectiveConsultCount,
      wonLeadCount,
      revenue: money(revenue),
      conversionRate,
      attendanceRecordCount: attendanceCount,
      attendanceRate: pct(presentCount, attendanceCount),
      checkInRate: pct(checkInCount, attendanceCount),
      absenceRate: pct(absentCount, attendanceCount),
      homeworkCompletionRate: pct(homeworkCompleted, homeworkSessions),
      wrongQuestionCount: input.wrongQuestionRecords.length,
      weakKnowledgePointCount: weakKnowledgeRows.length,
      refundRate: pct(refundCount, students.length),
      universityShare: money(universityShare),
      teacherFee: money(teacherFee),
      profit: money(profit)
    },
    channelRows: groupRows(leads, (lead) => crmLabels.sourceChannel[lead.sourceChannel], (items) => {
      const won = items.filter((lead) => lead.status === "WON").length;
      return { leadCount: items.length, wonCount: won, conversionRate: pct(won, items.length) };
    }),
    campusRows: groupRows(leads, (lead) => lead.campus?.name || "未分校区", (items) => {
      const won = items.filter((lead) => lead.status === "WON").length;
      return { leadCount: items.length, wonCount: won, revenue: money(won * financeDefaults.tuitionPerStudent), conversionRate: pct(won, items.length) };
    }),
    counselorRows: groupRows(leads, (lead) => lead.assignee?.name || "未分配", (items) => {
      const won = items.filter((lead) => lead.status === "WON").length;
      return { leadCount: items.length, consultCount: items.filter((lead) => lead.status !== "UNCONTACTED").length, wonCount: won, conversionRate: pct(won, items.length) };
    }),
    classRows: groupRows(students, (student) => student.class?.name || "未分班", (items) => {
      const classAttendance = attendance.filter((record) => items.some((student) => student.id === record.studentId));
      return {
        studentCount: items.length,
        attendanceRate: pct(classAttendance.filter((record) => record.status === "PRESENT" || record.status === "LATE").length, classAttendance.length),
        absenceRate: pct(classAttendance.filter((record) => record.status === "ABSENT").length, classAttendance.length)
      };
    }),
    weakKnowledgeRows
  };
}

function groupRows<T, R extends Record<string, unknown>>(items: T[], keyer: (item: T) => string, mapper: (items: T[]) => R) {
  const bucket = new Map<string, T[]>();
  for (const item of items) {
    const key = keyer(item);
    bucket.set(key, [...(bucket.get(key) || []), item]);
  }
  return Array.from(bucket.entries()).map(([name, groupItems]) => ({ name, ...mapper(groupItems) }));
}

export function buildTrendRows(leads: AnalyticsInput["leads"], students: AnalyticsInput["students"], from: Date, to: Date) {
  const rows: Array<{ date: string; leads: number; won: number; students: number }> = [];
  for (let cursor = startOfDay(from); cursor <= to; cursor.setDate(cursor.getDate() + 1)) {
    const dayStart = new Date(cursor);
    const dayEnd = new Date(cursor);
    dayEnd.setDate(dayEnd.getDate() + 1);
    rows.push({
      date: dayStart.toISOString().slice(0, 10),
      leads: leads.filter((lead) => lead.createdAt >= dayStart && lead.createdAt < dayEnd).length,
      won: leads.filter((lead) => lead.status === "WON" && lead.createdAt >= dayStart && lead.createdAt < dayEnd).length,
      students: students.filter((student) => student.enrolledAt >= dayStart && student.enrolledAt < dayEnd).length
    });
  }
  return rows;
}

export function buildDailyReport(summary: ReturnType<typeof computeAnalytics>, date = new Date()) {
  const o = summary.overview;
  return {
    reportDate: startOfDay(date),
    title: `${date.toISOString().slice(0, 10)} 每日经营日报`,
    summary: [
      `新增线索 ${o.newLeadCount} 条，有效咨询 ${o.effectiveConsultCount} 条，成交 ${o.wonLeadCount} 人，转化率 ${o.conversionRate}%。`,
      `预估成交金额 ${o.revenue} 元，校区利润估算 ${o.profit} 元。`,
      `到课率 ${o.attendanceRate}%，打卡率 ${o.checkInRate}%，缺课率 ${o.absenceRate}%。`,
      `错题 ${o.wrongQuestionCount} 道，薄弱知识点 ${o.weakKnowledgePointCount} 个。`
    ].join("\n"),
    metrics: summary as unknown as Prisma.InputJsonValue
  };
}
