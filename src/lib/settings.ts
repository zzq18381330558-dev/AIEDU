import type { CampusStatus, DictionaryCategory, Prisma, UserRole, UserStatus } from "@prisma/client";
import { roleLabels } from "@/lib/roles";

export const settingsRoleOptions: Array<{ value: UserRole; label: string; description: string }> = [
  { value: "ADMIN", label: "总部管理员", description: "查看和管理全部数据、账号、校区和系统配置" },
  { value: "CAMPUS_MANAGER", label: "校区负责人", description: "查看本校区经营、线索、学员和 SOP 执行" },
  { value: "ADMISSIONS_COUNSELOR", label: "招生老师", description: "只查看和跟进分配给自己的线索" },
  { value: "ACADEMIC_TEACHER", label: "教务老师", description: "只查看自己负责服务的学员" },
  { value: "LECTURER", label: "授课老师", description: "查看题库、教研内容和授课相关资料" }
];

export const userStatusOptions: Array<{ value: UserStatus; label: string }> = [
  { value: "ACTIVE", label: "启用" },
  { value: "DISABLED", label: "停用" }
];

export const campusStatusOptions: Array<{ value: CampusStatus; label: string }> = [
  { value: "ACTIVE", label: "启用" },
  { value: "DISABLED", label: "停用" }
];

export const dictionaryCategoryOptions: Array<{ value: DictionaryCategory; label: string }> = [
  { value: "SCHOOL", label: "学校" },
  { value: "MAJOR", label: "专业" },
  { value: "EXAM_TRACK", label: "教资方向" },
  { value: "LEAD_SOURCE", label: "线索来源" },
  { value: "QUESTION_TYPE", label: "题型" },
  { value: "DIFFICULTY", label: "难度" },
  { value: "CLASS_TYPE", label: "班型" }
];

export const settingsLabels = {
  role: {
    ...roleLabels,
    ADMIN: "总部管理员"
  } satisfies Record<UserRole, string>,
  userStatus: Object.fromEntries(userStatusOptions.map((item) => [item.value, item.label])) as Record<
    UserStatus,
    string
  >,
  campusStatus: Object.fromEntries(campusStatusOptions.map((item) => [item.value, item.label])) as Record<
    CampusStatus,
    string
  >,
  dictionaryCategory: Object.fromEntries(dictionaryCategoryOptions.map((item) => [item.value, item.label])) as Record<
    DictionaryCategory,
    string
  >
};

const dictionaryCategoryAlias = new Map<string, DictionaryCategory>(
  dictionaryCategoryOptions.flatMap((item) => [
    [item.value, item.value],
    [item.label, item.value]
  ])
);

const roleValues = new Set(settingsRoleOptions.map((item) => item.value));
const legacyRoleValues = new Set<UserRole>([...settingsRoleOptions.map((item) => item.value), "HQ_OPERATIONS"]);
const userStatusValues = new Set(userStatusOptions.map((item) => item.value));
const campusStatusValues = new Set(campusStatusOptions.map((item) => item.value));

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: unknown) {
  const normalized = text(value);
  return normalized ? normalized : null;
}

function enumOr<T extends string>(value: unknown, values: Set<T>, fallback: T) {
  return typeof value === "string" && values.has(value as T) ? (value as T) : fallback;
}

export function normalizeUserInput(
  input: Record<string, unknown>,
  defaults: { organizationId: string },
  options: { allowLegacyRoles?: boolean } = {}
) {
  const name = text(input.name);
  const email = text(input.email).toLowerCase();
  const role = text(input.role);
  const allowedRoles = options.allowLegacyRoles ? legacyRoleValues : roleValues;
  if (!name) throw new Error("请输入用户姓名");
  if (!email) throw new Error("请输入登录邮箱");
  if (role && !allowedRoles.has(role as UserRole)) throw new Error("不能选择该用户角色");

  return {
    organizationId: defaults.organizationId,
    campusId: nullableText(input.campusId),
    name,
    email,
    phone: nullableText(input.phone),
    role: role ? (role as UserRole) : "ADMISSIONS_COUNSELOR",
    status: enumOr(input.status, userStatusValues, "ACTIVE")
  } satisfies Omit<Prisma.UserUncheckedCreateInput, "passwordHash">;
}

export function normalizeCampusInput(input: Record<string, unknown>, defaults: { organizationId: string }) {
  const name = text(input.name);
  const code = text(input.code).toUpperCase();
  const city = text(input.city);
  if (!name) throw new Error("请输入校区名称");
  if (!code) throw new Error("请输入校区编码");
  if (!city) throw new Error("请输入城市");

  return {
    organizationId: defaults.organizationId,
    managerId: nullableText(input.managerId),
    name,
    code,
    city,
    contactPhone: nullableText(input.contactPhone),
    status: enumOr(input.status, campusStatusValues, "ACTIVE"),
    address: nullableText(input.address)
  } satisfies Prisma.CampusUncheckedCreateInput;
}

export function normalizeDictionaryInput(input: Record<string, unknown>, defaults: { organizationId: string }) {
  const categoryText = text(input.category);
  const name = text(input.name);
  if (!name) throw new Error("请输入字典名称");
  if (!categoryText) throw new Error("请输入字典分类");
  const category = dictionaryCategoryAlias.get(categoryText) || categoryText;

  return {
    organizationId: defaults.organizationId,
    category,
    name,
    value: nullableText(input.value),
    enabled: text(input.enabled) !== "false",
    sortOrder: Number.parseInt(text(input.sortOrder) || "0", 10) || 0
  };
}
