import { PrismaClient, UserRole, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

const KEEP_USER_NAME = "周自强";
const KEEP_USER_ID_NUMBER = "51112419920314621X";

type CountKey =
  | "campusManagers"
  | "leadCreators"
  | "leadAssignees"
  | "leadFollowUpCreators"
  | "studentAcademicOwners"
  | "studentSalesOwners"
  | "classAcademicOwners"
  | "classLecturers"
  | "courseSessionLecturers"
  | "attendanceRecorders"
  | "studentReminderCreators"
  | "serviceTicketOwners"
  | "teachingContentAuthors"
  | "teachingContentReviewers"
  | "sopTaskCheckInUsers"
  | "sopInspectionInspectors"
  | "sopWeeklyReportReporters"
  | "campusAssistantRows"
  | "userPermissionRows";

type CleanupPlan = Record<CountKey, number>;

const countLabels: Record<CountKey, string> = {
  campusManagers: "Campus.managerId 转移",
  leadCreators: "Lead.creatorId 转移",
  leadAssignees: "Lead.assigneeId 转移",
  leadFollowUpCreators: "LeadFollowUp.creatorId 转移",
  studentAcademicOwners: "Student.academicOwnerId 转移",
  studentSalesOwners: "Student.salesOwnerId 转移",
  classAcademicOwners: "StudentClass.academicOwnerId 转移",
  classLecturers: "StudentClass.lecturerId 转移",
  courseSessionLecturers: "CourseSession.lecturerId 转移",
  attendanceRecorders: "AttendanceRecord.recorderId 转移",
  studentReminderCreators: "StudentReminder.creatorId 转移",
  serviceTicketOwners: "ServiceTicket.ownerId 转移",
  teachingContentAuthors: "TeachingContent.authorId 转移",
  teachingContentReviewers: "TeachingContentReview.reviewerId 转移",
  sopTaskCheckInUsers: "SopTaskCheckIn.userId 转移",
  sopInspectionInspectors: "SopInspection.inspectorId 转移",
  sopWeeklyReportReporters: "SopWeeklyReport.reporterId 转移",
  campusAssistantRows: "CampusAssistant 关系删除",
  userPermissionRows: "UserPermission 个人权限删除"
};

function parseMode() {
  const hasExecute = process.argv.includes("--execute");
  const hasDryRun = process.argv.includes("--dry-run");
  if (hasExecute && hasDryRun) throw new Error("请只传入 --dry-run 或 --execute 其中一个参数");
  return hasExecute ? "execute" : "dry-run";
}

function maskIdNumber(value: string) {
  return `${value.slice(0, 4)}**********${value.slice(-4)}`;
}

function displayContact(user: { phone?: string | null }) {
  return user.phone || "无手机号";
}

function sumTransferCount(plan: CleanupPlan) {
  return Object.entries(plan)
    .filter(([key]) => key !== "campusAssistantRows" && key !== "userPermissionRows")
    .reduce((total, [, count]) => total + count, 0);
}

function sumRelationDeleteCount(plan: CleanupPlan) {
  return plan.campusAssistantRows + plan.userPermissionRows;
}

async function buildPlan(deleteUserIds: string[]): Promise<CleanupPlan> {
  const userIdFilter = { in: deleteUserIds };
  const [
    campusManagers,
    leadCreators,
    leadAssignees,
    leadFollowUpCreators,
    studentAcademicOwners,
    studentSalesOwners,
    classAcademicOwners,
    classLecturers,
    courseSessionLecturers,
    attendanceRecorders,
    studentReminderCreators,
    serviceTicketOwners,
    teachingContentAuthors,
    teachingContentReviewers,
    sopTaskCheckInUsers,
    sopInspectionInspectors,
    sopWeeklyReportReporters,
    campusAssistantRows,
    userPermissionRows
  ] = await Promise.all([
    prisma.campus.count({ where: { managerId: userIdFilter } }),
    prisma.lead.count({ where: { creatorId: userIdFilter } }),
    prisma.lead.count({ where: { assigneeId: userIdFilter } }),
    prisma.leadFollowUp.count({ where: { creatorId: userIdFilter } }),
    prisma.student.count({ where: { academicOwnerId: userIdFilter } }),
    prisma.student.count({ where: { salesOwnerId: userIdFilter } }),
    prisma.studentClass.count({ where: { academicOwnerId: userIdFilter } }),
    prisma.studentClass.count({ where: { lecturerId: userIdFilter } }),
    prisma.courseSession.count({ where: { lecturerId: userIdFilter } }),
    prisma.attendanceRecord.count({ where: { recorderId: userIdFilter } }),
    prisma.studentReminder.count({ where: { creatorId: userIdFilter } }),
    prisma.serviceTicket.count({ where: { ownerId: userIdFilter } }),
    prisma.teachingContent.count({ where: { authorId: userIdFilter } }),
    prisma.teachingContentReview.count({ where: { reviewerId: userIdFilter } }),
    prisma.sopTaskCheckIn.count({ where: { userId: userIdFilter } }),
    prisma.sopInspection.count({ where: { inspectorId: userIdFilter } }),
    prisma.sopWeeklyReport.count({ where: { reporterId: userIdFilter } }),
    prisma.campusAssistant.count({ where: { userId: userIdFilter } }),
    prisma.userPermission.count({ where: { userId: userIdFilter } })
  ]);

  return {
    campusManagers,
    leadCreators,
    leadAssignees,
    leadFollowUpCreators,
    studentAcademicOwners,
    studentSalesOwners,
    classAcademicOwners,
    classLecturers,
    courseSessionLecturers,
    attendanceRecorders,
    studentReminderCreators,
    serviceTicketOwners,
    teachingContentAuthors,
    teachingContentReviewers,
    sopTaskCheckInUsers,
    sopInspectionInspectors,
    sopWeeklyReportReporters,
    campusAssistantRows,
    userPermissionRows
  };
}

async function applyCleanup(keepUserId: string, deleteUserIds: string[]) {
  const userIdFilter = { in: deleteUserIds };
  await prisma.$transaction([
    prisma.user.update({ where: { id: keepUserId }, data: { role: UserRole.ADMIN, status: UserStatus.ACTIVE } }),
    prisma.campus.updateMany({ where: { managerId: userIdFilter }, data: { managerId: keepUserId } }),
    prisma.lead.updateMany({ where: { creatorId: userIdFilter }, data: { creatorId: keepUserId } }),
    prisma.lead.updateMany({ where: { assigneeId: userIdFilter }, data: { assigneeId: keepUserId } }),
    prisma.leadFollowUp.updateMany({ where: { creatorId: userIdFilter }, data: { creatorId: keepUserId } }),
    prisma.student.updateMany({ where: { academicOwnerId: userIdFilter }, data: { academicOwnerId: keepUserId } }),
    prisma.student.updateMany({ where: { salesOwnerId: userIdFilter }, data: { salesOwnerId: keepUserId } }),
    prisma.studentClass.updateMany({ where: { academicOwnerId: userIdFilter }, data: { academicOwnerId: keepUserId } }),
    prisma.studentClass.updateMany({ where: { lecturerId: userIdFilter }, data: { lecturerId: keepUserId } }),
    prisma.courseSession.updateMany({ where: { lecturerId: userIdFilter }, data: { lecturerId: keepUserId } }),
    prisma.attendanceRecord.updateMany({ where: { recorderId: userIdFilter }, data: { recorderId: keepUserId } }),
    prisma.studentReminder.updateMany({ where: { creatorId: userIdFilter }, data: { creatorId: keepUserId } }),
    prisma.serviceTicket.updateMany({ where: { ownerId: userIdFilter }, data: { ownerId: keepUserId } }),
    prisma.teachingContent.updateMany({ where: { authorId: userIdFilter }, data: { authorId: keepUserId } }),
    prisma.teachingContentReview.updateMany({ where: { reviewerId: userIdFilter }, data: { reviewerId: keepUserId } }),
    prisma.sopTaskCheckIn.updateMany({ where: { userId: userIdFilter }, data: { userId: keepUserId } }),
    prisma.sopInspection.updateMany({ where: { inspectorId: userIdFilter }, data: { inspectorId: keepUserId } }),
    prisma.sopWeeklyReport.updateMany({ where: { reporterId: userIdFilter }, data: { reporterId: keepUserId } }),
    prisma.campusAssistant.deleteMany({ where: { userId: userIdFilter } }),
    prisma.userPermission.deleteMany({ where: { userId: userIdFilter } }),
    prisma.user.deleteMany({ where: { id: userIdFilter } })
  ]);
}

async function verifyCleanup(keepUserId: string, deleteUserIds: string[]) {
  const [remainingUsers, keepUser, plan, campusesNotManagedByKeepUser] = await Promise.all([
    prisma.user.count(),
    prisma.user.findUnique({ where: { id: keepUserId }, select: { id: true, name: true, role: true, status: true, phone: true, idNumber: true, passwordHash: true } }),
    buildPlan(deleteUserIds),
    prisma.campus.count({ where: { managerId: { not: keepUserId } } })
  ]);

  const remainingDeletedUsers = await prisma.user.count({ where: { id: { in: deleteUserIds } } });
  return {
    remainingUsers,
    remainingDeletedUsers,
    keepUser,
    remainingDependencyCount: sumTransferCount(plan) + sumRelationDeleteCount(plan),
    campusesNotManagedByKeepUser
  };
}

function printPlan(plan: CleanupPlan) {
  for (const key of Object.keys(countLabels) as CountKey[]) {
    console.log(`- ${countLabels[key]}：${plan[key]}`);
  }
  console.log(`转移关联记录总数：${sumTransferCount(plan)}`);
  console.log(`删除关联关系总数：${sumRelationDeleteCount(plan)}`);
}

async function main() {
  const mode = parseMode();
  const keepUsers = await prisma.user.findMany({
    where: { name: KEEP_USER_NAME, idNumber: KEEP_USER_ID_NUMBER },
    select: { id: true, name: true, phone: true, idNumber: true, role: true, status: true, passwordHash: true }
  });

  if (keepUsers.length !== 1) {
    throw new Error(`保留用户匹配数量为 ${keepUsers.length}，必须且只能匹配 1 个用户`);
  }

  const keepUser = keepUsers[0];
  const deleteUsers = await prisma.user.findMany({
    where: { id: { not: keepUser.id } },
    select: { id: true, name: true, phone: true, role: true, status: true },
    orderBy: [{ role: "asc" }, { name: "asc" }]
  });
  const deleteUserIds = deleteUsers.map((user) => user.id);
  const plan = await buildPlan(deleteUserIds);

  console.log(`运行模式：${mode}`);
  console.log(`保留用户：${keepUser.name} / ${displayContact(keepUser)}`);
  console.log(`保留身份证号：${maskIdNumber(KEEP_USER_ID_NUMBER)}`);
  console.log(`保留用户当前状态：role=${keepUser.role}, status=${keepUser.status}`);
  console.log(`待删除无效用户数量：${deleteUsers.length}`);
  if (deleteUsers.length) {
    console.log("待删除用户：");
    for (const user of deleteUsers) {
      console.log(`- ${user.name} / ${displayContact(user)} / role=${user.role} / status=${user.status}`);
    }
  }
  console.log("清理计划：");
  printPlan(plan);
  console.log("外键风险：已覆盖当前 User 关联字段；执行时会先转移/删除关联，再删除用户。");

  if (mode === "dry-run") {
    console.log("dry-run 完成：未写入数据库。传入 --execute 后才会执行清理。");
    return;
  }

  if (deleteUserIds.includes(keepUser.id)) {
    throw new Error("安全检查失败：待删除用户包含保留用户");
  }

  await applyCleanup(keepUser.id, deleteUserIds);
  const verification = await verifyCleanup(keepUser.id, deleteUserIds);

  console.log("execute 完成。");
  console.log(`删除用户数量：${deleteUsers.length}`);
  console.log(`转移关联记录数量：${sumTransferCount(plan)}`);
  console.log(`删除关联关系数量：${sumRelationDeleteCount(plan)}`);
  console.log(`User 表剩余用户数量：${verification.remainingUsers}`);
  console.log(`待删除用户剩余数量：${verification.remainingDeletedUsers}`);
  console.log(`周自强 role/status：${verification.keepUser?.role || "-"} / ${verification.keepUser?.status || "-"}`);
  console.log(`周自强手机号保留：${verification.keepUser?.phone ? "是" : "否"}`);
  console.log(`周自强身份证号保留：${verification.keepUser?.idNumber === KEEP_USER_ID_NUMBER ? "是" : "否"}`);
  console.log(`周自强密码哈希存在：${verification.keepUser?.passwordHash ? "是" : "否"}`);
  console.log(`非周自强 managerId 校区数量：${verification.campusesNotManagedByKeepUser}`);
  console.log(`剩余待清依赖数量：${verification.remainingDependencyCount}`);
  console.log(`是否有外键风险：${verification.remainingDeletedUsers === 0 && verification.remainingDependencyCount === 0 ? "否" : "是"}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
