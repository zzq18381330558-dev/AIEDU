import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEST_CAMPUS_NAMES = ["V06校区A", "V06校区B"] as const;
const TEST_LEAD_NAMES = ["V06线索A", "V06线索B"] as const;
const TEST_STUDENT_NAMES = ["V06学员A", "V06学员B"] as const;
const TEST_CLASS_NAMES = ["V06班级A", "V06班级B", "测试版"] as const;
const TEST_LEAD_PHONE = "13800000000";
const TEST_STUDENT_PHONE = "13800001111";
const IMPORT_ACCEPTANCE_PREFIX = "批量导入验收";

const KEEP_USER_PHONE = "18381330558";
const KEEP_USER_NAME = "周自强";
const KEEP_ORGANIZATION_NAME = "AI 教育科技";
const KEEP_CAMPUS_NAMES = ["总部校区", "西华大学"] as const;
const EXPECTED_QUESTION_COUNT = 503;

type Mode = "dry-run" | "execute";

type TargetSummary = {
  campuses: Array<{ id: string; name: string; code: string }>;
  leads: Array<{ id: string; name: string; phone: string; campusName: string }>;
  students: Array<{ id: string; name: string; phone: string; campusName: string }>;
  classes: Array<{ id: string; name: string; campusName: string }>;
};

type CleanupPlan = {
  targets: TargetSummary;
  counts: Record<string, number>;
  keepChecks: Record<string, boolean | number>;
  risks: string[];
};

function parseMode(): Mode {
  const hasExecute = process.argv.includes("--execute");
  const hasDryRun = process.argv.includes("--dry-run");
  if (hasExecute && hasDryRun) {
    throw new Error("请只传入 --dry-run 或 --execute 其中一个参数");
  }
  return hasExecute ? "execute" : "dry-run";
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function batchNameWhere(): Prisma.StringFilter<"Student"> {
  return {
    gte: `${IMPORT_ACCEPTANCE_PREFIX}01`,
    lte: `${IMPORT_ACCEPTANCE_PREFIX}30`
  };
}

function leadTargetWhere(campusIds: string[]): Prisma.LeadWhereInput {
  return {
    OR: [
      { campusId: { in: campusIds } },
      { name: { in: [...TEST_LEAD_NAMES] } },
      { phone: TEST_LEAD_PHONE }
    ]
  };
}

function studentTargetWhere(campusIds: string[], leadIds: string[], classIds: string[]): Prisma.StudentWhereInput {
  return {
    OR: [
      { campusId: { in: campusIds } },
      { leadId: { in: leadIds } },
      { classId: { in: classIds } },
      { name: { in: [...TEST_STUDENT_NAMES] } },
      { name: batchNameWhere() },
      { phone: TEST_STUDENT_PHONE }
    ]
  };
}

function classTargetWhere(campusIds: string[]): Prisma.StudentClassWhereInput {
  return {
    OR: [
      { campusId: { in: campusIds } },
      { name: { in: [...TEST_CLASS_NAMES] } }
    ]
  };
}

async function collectTargets(): Promise<{
  campusIds: string[];
  leadIds: string[];
  studentIds: string[];
  classIds: string[];
  summary: TargetSummary;
}> {
  const campuses = await prisma.campus.findMany({
    where: { name: { in: [...TEST_CAMPUS_NAMES] } },
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" }
  });
  const campusIds = campuses.map((campus) => campus.id);

  const firstPassClasses = await prisma.studentClass.findMany({
    where: classTargetWhere(campusIds),
    select: { id: true, name: true, campus: { select: { name: true } } },
    orderBy: { name: "asc" }
  });
  const firstPassClassIds = firstPassClasses.map((studentClass) => studentClass.id);

  const firstPassLeads = await prisma.lead.findMany({
    where: leadTargetWhere(campusIds),
    select: { id: true, name: true, phone: true, campus: { select: { name: true } } },
    orderBy: { name: "asc" }
  });
  const leadIds = firstPassLeads.map((lead) => lead.id);

  const students = await prisma.student.findMany({
    where: studentTargetWhere(campusIds, leadIds, firstPassClassIds),
    select: { id: true, name: true, phone: true, campus: { select: { name: true } }, classId: true, leadId: true },
    orderBy: { name: "asc" }
  });
  const studentIds = students.map((student) => student.id);

  const relatedLeadIds = students.map((student) => student.leadId).filter(Boolean) as string[];
  const classIds = unique(firstPassClassIds);
  const finalLeadIds = unique([...leadIds, ...relatedLeadIds]);

  const [classes, leads] = await Promise.all([
    prisma.studentClass.findMany({
      where: { id: { in: classIds } },
      select: { id: true, name: true, campus: { select: { name: true } } },
      orderBy: { name: "asc" }
    }),
    prisma.lead.findMany({
      where: { id: { in: finalLeadIds } },
      select: { id: true, name: true, phone: true, campus: { select: { name: true } } },
      orderBy: { name: "asc" }
    })
  ]);

  return {
    campusIds,
    leadIds: finalLeadIds,
    studentIds,
    classIds,
    summary: {
      campuses,
      leads: leads.map((lead) => ({ id: lead.id, name: lead.name, phone: lead.phone, campusName: lead.campus.name })),
      students: students.map((student) => ({ id: student.id, name: student.name, phone: student.phone, campusName: student.campus.name })),
      classes: classes.map((studentClass) => ({ id: studentClass.id, name: studentClass.name, campusName: studentClass.campus.name }))
    }
  };
}

async function buildPlan(): Promise<CleanupPlan & { ids: { campusIds: string[]; leadIds: string[]; studentIds: string[]; classIds: string[]; sessionIds: string[]; executionIds: string[]; taskIds: string[] } }> {
  const { campusIds, leadIds, studentIds, classIds, summary } = await collectTargets();

  const [sessionRows, executionRows, taskRows] = await Promise.all([
    prisma.courseSession.findMany({
      where: { OR: [{ campusId: { in: campusIds } }, { classId: { in: classIds } }] },
      select: { id: true }
    }),
    prisma.sopExecution.findMany({
      where: { campusId: { in: campusIds } },
      select: { id: true }
    }),
    prisma.sopTask.findMany({
      where: { OR: [{ campusId: { in: campusIds } }, { sopExecutionId: { in: [] } }] },
      select: { id: true }
    })
  ]);

  const sessionIds = sessionRows.map((row) => row.id);
  const executionIds = executionRows.map((row) => row.id);
  const executionTaskRows = await prisma.sopTask.findMany({
    where: { sopExecutionId: { in: executionIds } },
    select: { id: true }
  });
  const taskIds = unique([...taskRows.map((row) => row.id), ...executionTaskRows.map((row) => row.id)]);

  const [
    leadFollowUps,
    studyPlans,
    attendanceRecords,
    studentReminders,
    courseSessions,
    serviceTickets,
    wrongQuestionRecords,
    sopTaskCheckIns,
    sopInspections,
    sopWeeklyReports,
    sopTasks,
    sopExecutions,
    studentsLinkedToClasses,
    usersOnTestCampuses,
    managedTestCampuses,
    campusAssistants,
    teachingContentPublications,
    classes,
    students,
    leads,
    campuses,
    keepUser,
    keepOrganization,
    keepCampusCount,
    rolePermissionCount,
    dictionaryCount,
    questionBankCount,
    questionCount,
    examPaperCount,
    sopTemplateCount,
    teachingContentCount
  ] = await Promise.all([
    prisma.leadFollowUp.count({ where: { leadId: { in: leadIds } } }),
    prisma.studyPlan.count({ where: { studentId: { in: studentIds } } }),
    prisma.attendanceRecord.count({ where: { OR: [{ studentId: { in: studentIds } }, { courseSessionId: { in: sessionIds } }] } }),
    prisma.studentReminder.count({
      where: {
        OR: [
          { studentId: { in: studentIds } },
          { classId: { in: classIds } },
          { courseSessionId: { in: sessionIds } }
        ]
      }
    }),
    prisma.courseSession.count({ where: { id: { in: sessionIds } } }),
    prisma.serviceTicket.count({ where: { studentId: { in: studentIds } } }),
    prisma.wrongQuestionRecord.count({ where: { studentId: { in: studentIds } } }),
    prisma.sopTaskCheckIn.count({ where: { taskId: { in: taskIds } } }),
    prisma.sopInspection.count({ where: { OR: [{ sopExecutionId: { in: executionIds } }] } }),
    prisma.sopWeeklyReport.count({ where: { OR: [{ campusId: { in: campusIds } }, { sopExecutionId: { in: executionIds } }] } }),
    prisma.sopTask.count({ where: { id: { in: taskIds } } }),
    prisma.sopExecution.count({ where: { id: { in: executionIds } } }),
    prisma.student.count({ where: { classId: { in: classIds }, id: { notIn: studentIds } } }),
    prisma.user.count({ where: { campusId: { in: campusIds } } }),
    prisma.campus.count({ where: { id: { in: campusIds }, managerId: { not: null } } }),
    prisma.campusAssistant.count({ where: { campusId: { in: campusIds } } }),
    prisma.teachingContentPublication.count({ where: { campusId: { in: campusIds } } }),
    prisma.studentClass.count({ where: { id: { in: classIds } } }),
    prisma.student.count({ where: { id: { in: studentIds } } }),
    prisma.lead.count({ where: { id: { in: leadIds } } }),
    prisma.campus.count({ where: { id: { in: campusIds } } }),
    prisma.user.findFirst({ where: { name: KEEP_USER_NAME, phone: KEEP_USER_PHONE }, select: { id: true, role: true, status: true } }),
    prisma.organization.count({ where: { name: KEEP_ORGANIZATION_NAME } }),
    prisma.campus.count({ where: { name: { in: [...KEEP_CAMPUS_NAMES] } } }),
    prisma.rolePermission.count(),
    prisma.businessDictionary.count(),
    prisma.questionBank.count(),
    prisma.question.count(),
    prisma.examPaper.count(),
    prisma.sopTemplate.count(),
    prisma.teachingContent.count()
  ]);

  const risks: string[] = [];
  if (studentsLinkedToClasses > 0) {
    risks.push(`有 ${studentsLinkedToClasses} 个非目标学员仍绑定目标班级，执行前需人工确认`);
  }
  if (!keepUser || keepUser.role !== "ADMIN" || keepUser.status !== "ACTIVE") {
    risks.push("周自强账号未匹配到 ADMIN/ACTIVE 状态");
  }
  if (keepOrganization !== 1) risks.push(`保留组织匹配数量为 ${keepOrganization}`);
  if (keepCampusCount !== KEEP_CAMPUS_NAMES.length) risks.push(`保留校区匹配数量为 ${keepCampusCount}`);
  if (questionCount !== EXPECTED_QUESTION_COUNT) risks.push(`题库题目数量当前为 ${questionCount}，不是预期 ${EXPECTED_QUESTION_COUNT}`);

  return {
    ids: { campusIds, leadIds, studentIds, classIds, sessionIds, executionIds, taskIds },
    targets: summary,
    counts: {
      LeadFollowUp: leadFollowUps,
      StudyPlan: studyPlans,
      AttendanceRecord: attendanceRecords,
      StudentReminder: studentReminders,
      CourseSession: courseSessions,
      SopTaskCheckIn: sopTaskCheckIns,
      SopInspection: sopInspections,
      SopWeeklyReport: sopWeeklyReports,
      SopTask: sopTasks,
      SopExecution: sopExecutions,
      ServiceTicket: serviceTickets,
      WrongQuestionRecord: wrongQuestionRecords,
      CampusAssistant: campusAssistants,
      TeachingContentPublication: teachingContentPublications,
      "User.campusId 解除引用": usersOnTestCampuses,
      "Campus.managerId 解除引用": managedTestCampuses,
      StudentClass: classes,
      Student: students,
      Lead: leads,
      Campus: campuses
    },
    keepChecks: {
      "周自强 ADMIN/ACTIVE": Boolean(keepUser && keepUser.role === "ADMIN" && keepUser.status === "ACTIVE"),
      "AI 教育科技": keepOrganization,
      "总部校区/西华大学": keepCampusCount,
      RolePermission: rolePermissionCount,
      BusinessDictionary: dictionaryCount,
      QuestionBank: questionBankCount,
      Question: questionCount,
      ExamPaper: examPaperCount,
      SopTemplate: sopTemplateCount,
      TeachingContent: teachingContentCount
    },
    risks
  };
}

async function executeCleanup(plan: Awaited<ReturnType<typeof buildPlan>>) {
  if (plan.risks.length > 0) {
    throw new Error(`存在外键或保留数据风险，已停止执行：${plan.risks.join("；")}`);
  }

  const { campusIds, leadIds, studentIds, classIds, sessionIds, executionIds, taskIds } = plan.ids;

  await prisma.$transaction([
    prisma.leadFollowUp.deleteMany({ where: { leadId: { in: leadIds } } }),
    prisma.attendanceRecord.deleteMany({ where: { OR: [{ studentId: { in: studentIds } }, { courseSessionId: { in: sessionIds } }] } }),
    prisma.studentReminder.deleteMany({
      where: {
        OR: [
          { studentId: { in: studentIds } },
          { classId: { in: classIds } },
          { courseSessionId: { in: sessionIds } }
        ]
      }
    }),
    prisma.courseSession.deleteMany({ where: { id: { in: sessionIds } } }),
    prisma.sopTaskCheckIn.deleteMany({ where: { taskId: { in: taskIds } } }),
    prisma.sopInspection.deleteMany({ where: { sopExecutionId: { in: executionIds } } }),
    prisma.sopWeeklyReport.deleteMany({ where: { OR: [{ campusId: { in: campusIds } }, { sopExecutionId: { in: executionIds } }] } }),
    prisma.sopTask.deleteMany({ where: { id: { in: taskIds } } }),
    prisma.sopExecution.deleteMany({ where: { id: { in: executionIds } } }),
    prisma.studyPlan.deleteMany({ where: { studentId: { in: studentIds } } }),
    prisma.serviceTicket.deleteMany({ where: { studentId: { in: studentIds } } }),
    prisma.wrongQuestionRecord.deleteMany({ where: { studentId: { in: studentIds } } }),
    prisma.student.updateMany({ where: { id: { in: studentIds } }, data: { classId: null } }),
    prisma.studentClass.deleteMany({ where: { id: { in: classIds } } }),
    prisma.student.deleteMany({ where: { id: { in: studentIds } } }),
    prisma.lead.deleteMany({ where: { id: { in: leadIds } } }),
    prisma.campusAssistant.deleteMany({ where: { campusId: { in: campusIds } } }),
    prisma.teachingContentPublication.deleteMany({ where: { campusId: { in: campusIds } } }),
    prisma.user.updateMany({ where: { campusId: { in: campusIds } }, data: { campusId: null } }),
    prisma.campus.updateMany({ where: { id: { in: campusIds } }, data: { managerId: null } }),
    prisma.campus.deleteMany({ where: { id: { in: campusIds } } })
  ]);
}

async function verifyAfterCleanup() {
  const [
    v06Campus,
    v06Lead,
    testPhoneLead,
    v06Student,
    importStudents,
    testPhoneStudent,
    testClasses,
    keepUser,
    hqCampus,
    xihuaCampus,
    questions,
    sopTemplates,
    rolePermissions,
    dictionaries,
    questionBanks,
    examPapers,
    teachingContents
  ] = await Promise.all([
    prisma.campus.count({ where: { name: { in: [...TEST_CAMPUS_NAMES] } } }),
    prisma.lead.count({ where: { name: { in: [...TEST_LEAD_NAMES] } } }),
    prisma.lead.count({ where: { phone: TEST_LEAD_PHONE } }),
    prisma.student.count({ where: { name: { in: [...TEST_STUDENT_NAMES] } } }),
    prisma.student.count({ where: { name: batchNameWhere() } }),
    prisma.student.count({ where: { phone: TEST_STUDENT_PHONE } }),
    prisma.studentClass.count({ where: { name: { in: [...TEST_CLASS_NAMES] } } }),
    prisma.user.findFirst({ where: { name: KEEP_USER_NAME, phone: KEEP_USER_PHONE }, select: { role: true, status: true } }),
    prisma.campus.count({ where: { name: "总部校区" } }),
    prisma.campus.count({ where: { name: "西华大学" } }),
    prisma.question.count(),
    prisma.sopTemplate.count(),
    prisma.rolePermission.count(),
    prisma.businessDictionary.count(),
    prisma.questionBank.count(),
    prisma.examPaper.count(),
    prisma.teachingContent.count()
  ]);

  return {
    "V06校区剩余": v06Campus,
    "V06线索剩余": v06Lead,
    "13800000000 线索剩余": testPhoneLead,
    "V06学员剩余": v06Student,
    "批量导入验收学员剩余": importStudents,
    "13800001111 学员剩余": testPhoneStudent,
    "测试班级剩余": testClasses,
    "周自强 ADMIN/ACTIVE": Boolean(keepUser && keepUser.role === "ADMIN" && keepUser.status === "ACTIVE"),
    "总部校区保留": hqCampus,
    "西华大学保留": xihuaCampus,
    Question: questions,
    SopTemplate: sopTemplates,
    RolePermission: rolePermissions,
    BusinessDictionary: dictionaries,
    QuestionBank: questionBanks,
    ExamPaper: examPapers,
    TeachingContent: teachingContents
  };
}

function printItems(title: string, items: string[]) {
  console.log(title);
  if (items.length === 0) {
    console.log("- 无");
    return;
  }
  for (const item of items) console.log(`- ${item}`);
}

function printPlan(mode: Mode, plan: CleanupPlan) {
  console.log(`运行模式：${mode}`);
  console.log("清理范围：仅明确测试业务数据；不删除用户、权限、业务字典、题库、试卷、SOP 模板、教研内容本体。");
  printItems("目标校区：", plan.targets.campuses.map((campus) => `${campus.name} / code=${campus.code}`));
  printItems("目标线索：", plan.targets.leads.map((lead) => `${lead.name} / ${lead.phone} / ${lead.campusName}`));
  printItems("目标学员：", plan.targets.students.map((student) => `${student.name} / ${student.phone} / ${student.campusName}`));
  printItems("目标班级：", plan.targets.classes.map((studentClass) => `${studentClass.name} / ${studentClass.campusName}`));
  console.log("删除或解除引用数量：");
  for (const [name, count] of Object.entries(plan.counts)) {
    console.log(`- ${name}：${count}`);
  }
  console.log("保留数据检查：");
  for (const [name, value] of Object.entries(plan.keepChecks)) {
    console.log(`- ${name}：${value}`);
  }
  console.log(`是否存在外键风险：${plan.risks.length === 0 ? "否" : "是"}`);
  if (plan.risks.length > 0) {
    for (const risk of plan.risks) console.log(`- ${risk}`);
  }
}

function hasRemainingTestData(verification: Record<string, boolean | number>) {
  const remainingKeys = [
    "V06校区剩余",
    "V06线索剩余",
    "13800000000 线索剩余",
    "V06学员剩余",
    "批量导入验收学员剩余",
    "13800001111 学员剩余",
    "测试班级剩余"
  ];
  return remainingKeys.some((key) => Number(verification[key]) > 0);
}

async function main() {
  const mode = parseMode();
  const plan = await buildPlan();
  printPlan(mode, plan);

  if (mode === "dry-run") {
    console.log("dry-run 完成：未写入数据库。传入 --execute 后才会执行清理。");
    return;
  }

  await executeCleanup(plan);
  const verification = await verifyAfterCleanup();

  console.log("execute 完成。");
  console.log("执行后验证：");
  for (const [name, value] of Object.entries(verification)) {
    console.log(`- ${name}：${value}`);
  }
  console.log(`是否存在未清理测试数据：${hasRemainingTestData(verification) ? "是" : "否"}`);
  console.log(`是否存在外键风险：否`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
