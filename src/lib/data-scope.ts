import type { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type DataScopeUser = {
  id: string;
  role: UserRole;
  campusId: string | null;
  organizationId: string;
};

const none = { id: "__none__" };

export function isGlobalDataRole(role: UserRole) {
  return role === "ADMIN";
}

export async function getAssistantCampusIds(user: DataScopeUser, options: { activeOnly?: boolean } = {}) {
  const statusWhere = options.activeOnly ? { status: "ACTIVE" as const } : {};
  const rows = await prisma.campusAssistant.findMany({
    where: {
      userId: user.id,
      campus: { organizationId: user.organizationId, ...statusWhere }
    },
    select: { campusId: true }
  });
  return rows.map((row) => row.campusId);
}

export async function hasAssistantCampus(user: DataScopeUser, options: { activeOnly?: boolean } = {}) {
  const statusWhere = options.activeOnly ? { status: "ACTIVE" as const } : {};
  const row = await prisma.campusAssistant.findFirst({
    where: {
      userId: user.id,
      campus: { organizationId: user.organizationId, ...statusWhere }
    },
    select: { id: true }
  });
  return Boolean(row);
}

export async function getAccessibleCampusIds(user: DataScopeUser, options: { activeOnly?: boolean } = {}) {
  const statusWhere = options.activeOnly ? { status: "ACTIVE" as const } : {};
  const campuses = await prisma.campus.findMany({
    where: isGlobalDataRole(user.role)
      ? { organizationId: user.organizationId, ...statusWhere }
      : {
          organizationId: user.organizationId,
          ...statusWhere,
          OR: [
            { id: user.campusId || "__none__" },
            { managerId: user.id },
            { assistants: { some: { userId: user.id } } }
          ]
        },
    select: { id: true }
  });
  return campuses.map((campus) => campus.id);
}

export async function getUserCampusDisplayNames(user: DataScopeUser) {
  const campuses = await prisma.campus.findMany({
    where: {
      organizationId: user.organizationId,
      status: "ACTIVE",
      OR: [
        { id: user.campusId || "__none__" },
        { managerId: user.id },
        { assistants: { some: { userId: user.id } } }
      ]
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });
  return Array.from(new Map(campuses.map((campus) => [campus.id, campus.name])).values());
}

export async function canAccessCampusId(
  user: DataScopeUser,
  campusId: string | null | undefined,
  options: { activeOnly?: boolean } = {}
) {
  if (!campusId) return false;
  const campus = await prisma.campus.findFirst({
    where: { AND: [{ id: campusId }, await buildAccessibleCampusWhere(user, options)] },
    select: { id: true }
  });
  return Boolean(campus);
}

export async function buildAccessibleCampusWhere(
  user: DataScopeUser,
  options: { activeOnly?: boolean } = {}
): Promise<Prisma.CampusWhereInput> {
  if (isGlobalDataRole(user.role)) {
    return { organizationId: user.organizationId, ...(options.activeOnly ? { status: "ACTIVE" as const } : {}) };
  }
  const ids = await getAccessibleCampusIds(user, options);
  return ids.length ? { id: { in: ids } } : none;
}

export async function buildCampusScopeWhere(
  user: DataScopeUser,
  campusField = "campusId"
): Promise<Record<string, unknown>> {
  if (isGlobalDataRole(user.role)) return {};
  const campusIds = await getAccessibleCampusIds(user);
  return campusIds.length ? { [campusField]: { in: campusIds } } : none;
}

export async function buildScopedUserWhere(user: DataScopeUser, role: UserRole): Promise<Prisma.UserWhereInput> {
  const base: Prisma.UserWhereInput = { role, status: "ACTIVE", organizationId: user.organizationId };
  if (isGlobalDataRole(user.role)) return base;
  const campusIds = await getAccessibleCampusIds(user, { activeOnly: true });
  if (user.role === role && (role === "ADMISSIONS_COUNSELOR" || role === "ACADEMIC_TEACHER" || role === "LECTURER")) {
    return { ...base, id: user.id };
  }
  return campusIds.length ? { ...base, campusId: { in: campusIds } } : { ...base, id: "__none__" };
}

export async function buildCrmLeadScopeWhere(user: DataScopeUser): Promise<Prisma.LeadWhereInput> {
  if (isGlobalDataRole(user.role)) return {};
  if (user.role === "CAMPUS_MANAGER") return buildCampusScopeWhere(user) as Promise<Prisma.LeadWhereInput>;
  if (await hasAssistantCampus(user)) {
    const campusIds = await getAssistantCampusIds(user);
    return campusIds.length ? { campusId: { in: campusIds } } : none;
  }
  if (user.role === "ADMISSIONS_COUNSELOR") {
    return { OR: [{ assigneeId: user.id }, { creatorId: user.id }] };
  }
  return none;
}

export async function buildStudentScopeWhere(user: DataScopeUser): Promise<Prisma.StudentWhereInput> {
  if (isGlobalDataRole(user.role)) return {};
  if (user.role === "CAMPUS_MANAGER") return buildCampusScopeWhere(user) as Promise<Prisma.StudentWhereInput>;
  if (await hasAssistantCampus(user)) {
    const campusIds = await getAssistantCampusIds(user);
    return campusIds.length ? { campusId: { in: campusIds } } : none;
  }
  if (user.role === "ADMISSIONS_COUNSELOR") {
    return { OR: [{ salesOwnerId: user.id }, { lead: { OR: [{ assigneeId: user.id }, { creatorId: user.id }] } }] };
  }
  if (user.role === "ACADEMIC_TEACHER") {
    return { OR: [{ academicOwnerId: user.id }, { class: { academicOwnerId: user.id } }] };
  }
  if (user.role === "LECTURER") {
    return { class: { OR: [{ lecturerId: user.id }, { sessions: { some: { lecturerId: user.id } } }] } };
  }
  return none;
}

export async function buildClassScopeWhere(user: DataScopeUser): Promise<Prisma.StudentClassWhereInput> {
  if (isGlobalDataRole(user.role)) return {};
  if (user.role === "CAMPUS_MANAGER") return buildCampusScopeWhere(user) as Promise<Prisma.StudentClassWhereInput>;
  if (await hasAssistantCampus(user)) {
    const campusIds = await getAssistantCampusIds(user);
    return campusIds.length ? { campusId: { in: campusIds } } : none;
  }
  if (user.role === "ACADEMIC_TEACHER") {
    return { OR: [{ academicOwnerId: user.id }, { students: { some: { academicOwnerId: user.id } } }] };
  }
  if (user.role === "LECTURER") {
    return { OR: [{ lecturerId: user.id }, { sessions: { some: { lecturerId: user.id } } }] };
  }
  return none;
}

export async function buildCourseSessionScopeWhere(user: DataScopeUser): Promise<Prisma.CourseSessionWhereInput> {
  if (isGlobalDataRole(user.role)) return {};
  if (user.role === "CAMPUS_MANAGER") return buildCampusScopeWhere(user) as Promise<Prisma.CourseSessionWhereInput>;
  if (await hasAssistantCampus(user)) {
    const campusIds = await getAssistantCampusIds(user);
    return campusIds.length ? { campusId: { in: campusIds } } : none;
  }
  if (user.role === "ACADEMIC_TEACHER") {
    return { class: { OR: [{ academicOwnerId: user.id }, { students: { some: { academicOwnerId: user.id } } }] } };
  }
  if (user.role === "LECTURER") {
    return { OR: [{ lecturerId: user.id }, { class: { lecturerId: user.id } }] };
  }
  return none;
}

export async function buildAttendanceScopeWhere(user: DataScopeUser): Promise<Prisma.AttendanceRecordWhereInput> {
  if (isGlobalDataRole(user.role)) return {};
  return {
    OR: [
      { student: await buildStudentScopeWhere(user) },
      { courseSession: await buildCourseSessionScopeWhere(user) }
    ]
  };
}

export async function buildSopScopeWhere(user: DataScopeUser): Promise<{
  campus: Prisma.CampusWhereInput;
  execution: Prisma.SopExecutionWhereInput;
  task: Prisma.SopTaskWhereInput;
  weeklyReport: Prisma.SopWeeklyReportWhereInput;
  inspection: Prisma.SopInspectionWhereInput;
}> {
  if (isGlobalDataRole(user.role)) {
    const campus = { organizationId: user.organizationId };
    return {
      campus,
      execution: { campus },
      task: { campus },
      weeklyReport: { campus },
      inspection: { OR: [{ sopExecutionId: null }, { execution: { campus } }] }
    };
  }
  if (user.role !== "CAMPUS_MANAGER" && !(await hasAssistantCampus(user))) {
    return { campus: none, execution: none, task: none, weeklyReport: none, inspection: { id: "__none__" } };
  }
  const campusIds = user.role === "CAMPUS_MANAGER" ? await getAccessibleCampusIds(user) : await getAssistantCampusIds(user);
  const direct = campusIds.length ? { campusId: { in: campusIds } } : none;
  return {
    campus: campusIds.length ? { id: { in: campusIds } } : none,
    execution: direct,
    task: direct,
    weeklyReport: direct,
    inspection: { execution: direct }
  };
}

export async function buildCampusMaterialScopeWhere(
  user: DataScopeUser
): Promise<Prisma.TeachingContentPublicationWhereInput> {
  if (isGlobalDataRole(user.role)) return {};
  const campusIds = await getAccessibleCampusIds(user);
  return campusIds.length ? { campusId: { in: campusIds } } : { campusId: "__none__" };
}

export async function buildAnalyticsScope(user: DataScopeUser) {
  return {
    leadWhere: await buildCrmLeadScopeWhere(user),
    studentWhere: await buildStudentScopeWhere(user),
    attendanceWhere: await buildAttendanceScopeWhere(user),
    courseSessionWhere: await buildCourseSessionScopeWhere(user),
    wrongQuestionWhere: { student: await buildStudentScopeWhere(user) } satisfies Prisma.WrongQuestionRecordWhereInput
  };
}
