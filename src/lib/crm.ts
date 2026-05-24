import type {
  LeadExamTrack,
  LeadIntentLevel,
  LeadSourceChannel,
  LeadStatus,
  Prisma,
  UserRole
} from "@prisma/client";
import { getUserDisplayName } from "@/lib/user-display";

export const examTrackOptions: Array<{ value: LeadExamTrack; label: string }> = [
  { value: "INFANT", label: "幼儿" },
  { value: "PRIMARY", label: "小学" },
  { value: "MIDDLE", label: "中学" }
];

export const sourceChannelOptions: Array<{ value: LeadSourceChannel; label: string }> = [
  { value: "UNIVERSITY_PARTNERSHIP", label: "高校合作" },
  { value: "CAMPUS_PROMOTION", label: "校园推广" },
  { value: "WECHAT_MOMENTS", label: "朋友圈" },
  { value: "SHORT_VIDEO", label: "短视频" },
  { value: "GROUND_PROMOTION", label: "地推" },
  { value: "ENTERPRISE_WECHAT", label: "企业微信" },
  { value: "REFERRAL", label: "转介绍" },
  { value: "OTHER", label: "其他" }
];

export const intentLevelOptions: Array<{ value: LeadIntentLevel; label: string; score: number }> = [
  { value: "LOW", label: "低", score: 1 },
  { value: "MEDIUM", label: "中", score: 2 },
  { value: "HIGH", label: "高", score: 3 },
  { value: "STRONG", label: "强", score: 4 }
];

export const leadStatusOptions: Array<{ value: LeadStatus; label: string }> = [
  { value: "UNCONTACTED", label: "未联系" },
  { value: "CONTACTED", label: "已联系" },
  { value: "TRIAL", label: "试听" },
  { value: "CONSIDERING", label: "考虑中" },
  { value: "WON", label: "已成交" },
  { value: "LOST", label: "已流失" }
];

export const crmLabels = {
  examTrack: Object.fromEntries(examTrackOptions.map((item) => [item.value, item.label])) as Record<
    LeadExamTrack,
    string
  >,
  sourceChannel: Object.fromEntries(sourceChannelOptions.map((item) => [item.value, item.label])) as Record<
    LeadSourceChannel,
    string
  >,
  intentLevel: Object.fromEntries(intentLevelOptions.map((item) => [item.value, item.label])) as Record<
    LeadIntentLevel,
    string
  >,
  status: Object.fromEntries(leadStatusOptions.map((item) => [item.value, item.label])) as Record<
    LeadStatus,
    string
  >
};

export type LeadFormInput = {
  name?: unknown;
  phone?: unknown;
  wechat?: unknown;
  school?: unknown;
  grade?: unknown;
  major?: unknown;
  examTrack?: unknown;
  sourceChannel?: unknown;
  campusId?: unknown;
  assigneeId?: unknown;
  intentLevel?: unknown;
  status?: unknown;
  nextFollowUpAt?: unknown;
  note?: unknown;
};

export type FollowUpInput = {
  content?: unknown;
  status?: unknown;
  intentLevel?: unknown;
  nextAt?: unknown;
};

type LeadDefaults = {
  campusId: string;
  creatorId: string;
};

const validValues = {
  examTrack: new Set(examTrackOptions.map((item) => item.value)),
  sourceChannel: new Set(sourceChannelOptions.map((item) => item.value)),
  intentLevel: new Set(intentLevelOptions.map((item) => item.value)),
  status: new Set(leadStatusOptions.map((item) => item.value))
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: unknown) {
  const normalized = text(value);
  return normalized ? normalized : null;
}

function nullableDate(value: unknown) {
  const normalized = text(value);
  if (!normalized) return null;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function enumOr<T extends string>(value: unknown, set: Set<T>, fallback: T) {
  return typeof value === "string" && set.has(value as T) ? (value as T) : fallback;
}

export function normalizeLeadInput(input: LeadFormInput, defaults: LeadDefaults) {
  const name = text(input.name);
  const phone = text(input.phone).replace(/\s/g, "");
  const campusId = text(input.campusId) || defaults.campusId;

  if (!name) throw new Error("请输入姓名");
  if (!phone) throw new Error("请输入手机号");
  if (!campusId) throw new Error("请选择所属校区");

  return {
    campusId,
    creatorId: defaults.creatorId,
    assigneeId: nullableText(input.assigneeId),
    name,
    phone,
    wechat: nullableText(input.wechat),
    school: nullableText(input.school),
    grade: nullableText(input.grade),
    major: nullableText(input.major),
    examTrack: enumOr(input.examTrack, validValues.examTrack, "PRIMARY"),
    sourceChannel: enumOr(input.sourceChannel, validValues.sourceChannel, "OTHER"),
    status: enumOr(input.status, validValues.status, "UNCONTACTED"),
    intentLevel: enumOr(input.intentLevel, validValues.intentLevel, "MEDIUM"),
    nextFollowUpAt: nullableDate(input.nextFollowUpAt),
    note: nullableText(input.note)
  } satisfies Prisma.LeadUncheckedCreateInput;
}

export function normalizeLeadUpdateInput(input: LeadFormInput) {
  const data: Prisma.LeadUncheckedUpdateInput = {};
  const fields = normalizeLeadInput(input, {
    creatorId: "placeholder",
    campusId: text(input.campusId)
  });

  data.campusId = fields.campusId;
  data.assigneeId = fields.assigneeId;
  data.name = fields.name;
  data.phone = fields.phone;
  data.wechat = fields.wechat;
  data.school = fields.school;
  data.grade = fields.grade;
  data.major = fields.major;
  data.examTrack = fields.examTrack;
  data.sourceChannel = fields.sourceChannel;
  data.status = fields.status;
  data.intentLevel = fields.intentLevel;
  data.nextFollowUpAt = fields.nextFollowUpAt;
  data.note = fields.note;

  return data;
}

export function normalizeFollowUpInput(input: FollowUpInput) {
  const content = text(input.content);
  if (!content) throw new Error("请输入跟进内容");

  return {
    content,
    status: enumOr(input.status, validValues.status, "CONTACTED"),
    intentLevel: enumOr(input.intentLevel, validValues.intentLevel, "MEDIUM"),
    nextAt: nullableDate(input.nextAt)
  };
}

export function getTodayRange(now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}

export function leadScopeWhere(user: { id: string; role: UserRole; campusId: string | null }) {
  if (user.role === "ADMIN") return {};
  if (user.role === "CAMPUS_MANAGER") return user.campusId ? { campusId: user.campusId } : { id: "__none__" };
  if (user.role === "ADMISSIONS_COUNSELOR") return { assigneeId: user.id };
  return { id: "__none__" };
}

export function buildPerformanceRows(
  users: Array<{ id: string; name?: string | null; phone?: string | null; campus?: { name: string } | null }>,
  leads: Array<{ assigneeId: string | null; status: LeadStatus; createdAt: Date }>
) {
  return users.map((user) => {
    const owned = leads.filter((lead) => lead.assigneeId === user.id);
    const won = owned.filter((lead) => lead.status === "WON").length;
    const contacted = owned.filter((lead) => lead.status !== "UNCONTACTED").length;
    return {
      userId: user.id,
      name: getUserDisplayName(user),
      campusName: user.campus?.name || "-",
      assignedCount: owned.length,
      contactedCount: contacted,
      wonCount: won,
      conversionRate: owned.length ? Math.round((won / owned.length) * 1000) / 10 : 0
    };
  });
}

export const leadImportHeaders = [
  "姓名",
  "手机号",
  "微信号",
  "学校",
  "年级",
  "专业",
  "教资方向",
  "来源渠道",
  "意向等级",
  "跟进状态",
  "下次跟进时间",
  "备注"
] as const;

export const leadImportRequiredHeaders = ["姓名", "手机号"] as const;

const importHeaderMap: Record<(typeof leadImportHeaders)[number], keyof LeadFormInput> = {
  姓名: "name",
  手机号: "phone",
  微信号: "wechat",
  学校: "school",
  年级: "grade",
  专业: "major",
  教资方向: "examTrack",
  来源渠道: "sourceChannel",
  意向等级: "intentLevel",
  跟进状态: "status",
  下次跟进时间: "nextFollowUpAt",
  备注: "note"
};

const valueAliases: Record<string, string> = {
  幼儿: "INFANT",
  小学: "PRIMARY",
  中学: "MIDDLE",
  高校合作: "UNIVERSITY_PARTNERSHIP",
  校园推广: "CAMPUS_PROMOTION",
  朋友圈: "WECHAT_MOMENTS",
  短视频: "SHORT_VIDEO",
  地推: "GROUND_PROMOTION",
  企业微信: "ENTERPRISE_WECHAT",
  转介绍: "REFERRAL",
  其他: "OTHER",
  低: "LOW",
  中: "MEDIUM",
  高: "HIGH",
  强: "STRONG",
  未联系: "UNCONTACTED",
  已联系: "CONTACTED",
  试听: "TRIAL",
  考虑中: "CONSIDERING",
  已成交: "WON",
  已流失: "LOST"
};

export function normalizeImportRow(row: Record<string, unknown>) {
  const input: LeadFormInput = {};
  for (const [header, key] of Object.entries(importHeaderMap)) {
    const raw = row[header];
    const value = typeof raw === "string" ? raw.trim() : raw;
    input[key] = typeof value === "string" && valueAliases[value] ? valueAliases[value] : value;
  }
  return input;
}
