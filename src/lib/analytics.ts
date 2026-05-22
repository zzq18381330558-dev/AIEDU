import type {
  AttendanceStatus,
  LeadSourceChannel,
  LeadStatus,
  Prisma,
  UserRole
} from "@prisma/client";
import { crmLabels } from "@/lib/crm";

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
    campus?: { name: string } | null;
    class?: { name: string } | null;
    salesOwner?: { name: string } | null;
  }>;
  attendance: Array<{
    status: AttendanceStatus;
    studentId: string;
    courseSession?: { homework: string | null; class?: { id: string; name: string } | null } | null;
  }>;
  classCount: number;
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
  const attendanceWhere: Prisma.AttendanceRecordWhereInput = { createdAt: { gte: filters.from, lte: filters.to } };

  if (user.role === "CAMPUS_MANAGER" && user.campusId) {
    leadWhere.campusId = user.campusId;
    studentWhere.campusId = user.campusId;
    attendanceWhere.student = { campusId: user.campusId };
  }
  if (filters.campusId) {
    leadWhere.campusId = filters.campusId;
    studentWhere.campusId = filters.campusId;
    attendanceWhere.student = { campusId: filters.campusId };
  }
  if (filters.assigneeId) {
    leadWhere.assigneeId = filters.assigneeId;
    studentWhere.salesOwnerId = filters.assigneeId;
    attendanceWhere.student = { ...(attendanceWhere.student as object), salesOwnerId: filters.assigneeId };
  }
  return { leadWhere, studentWhere, attendanceWhere };
}

export function buildClassWhere(
  user: { role: UserRole; campusId: string | null; organizationId: string },
  filters: AnalyticsFilters
): Prisma.StudentClassWhereInput {
  if (filters.campusId) return { campusId: filters.campusId };
  if (user.role === "ADMIN" || user.role === "HQ_OPERATIONS") {
    return { campus: { organizationId: user.organizationId } };
  }
  return user.campusId ? { campusId: user.campusId } : { id: "__none__" };
}

export function computeAnalytics(input: AnalyticsInput) {
  const leads = input.leads;
  const students = input.students;
  const attendance = input.attendance;

  const newLeadCount = leads.length;
  const effectiveConsultCount = leads.filter((lead) => lead.status !== "UNCONTACTED").length;
  const wonLeadCount = leads.filter((lead) => lead.status === "WON").length || students.length;
  const refundCount = students.filter((student) => student.studyStatus === "REFUNDED").length;
  const conversionRate = pct(wonLeadCount, newLeadCount);
  const attendanceCount = attendance.length;
  const presentCount = attendance.filter((item) => item.status === "PRESENT" || item.status === "LATE").length;
  const checkInCount = attendance.filter((item) => item.status !== "ABSENT").length;
  const homeworkSessions = attendance.filter((item) => Boolean(item.courseSession?.homework)).length;
  const homeworkCompleted = attendance.filter((item) => Boolean(item.courseSession?.homework) && item.status !== "ABSENT").length;

  const revenue = wonLeadCount * financeDefaults.tuitionPerStudent;
  const universityShare = revenue * financeDefaults.universityShareRate;
  const teacherFee = input.classCount * financeDefaults.hoursPerClass * financeDefaults.teacherFeePerClassHour;
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
      attendanceRate: pct(presentCount, attendanceCount),
      checkInRate: pct(checkInCount, attendanceCount),
      homeworkCompletionRate: pct(homeworkCompleted, homeworkSessions),
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
      return { studentCount: items.length, attendanceRate: pct(classAttendance.filter((record) => record.status !== "ABSENT").length, classAttendance.length) };
    })
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
      students: students.filter((student) => student.id && dayStart <= to && dayEnd >= from).length
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
      `到课率 ${o.attendanceRate}%，打卡率 ${o.checkInRate}%，作业完成率 ${o.homeworkCompletionRate}%。`
    ].join("\n"),
    metrics: summary as unknown as Prisma.InputJsonValue
  };
}
