import bcrypt from "bcryptjs";
import {
  CampusBusinessType,
  CampusStatus,
  ContentStatus,
  LeadStatus,
  Prisma,
  PrismaClient,
  QuestionSource,
  QuestionSubject,
  QuestionType,
  SopTaskStatus,
  TeachingContentType,
  UserRole,
  UserStatus
} from "@prisma/client";

const prisma = new PrismaClient();

const PREFIX = "V06_TEST_";
const DEFAULT_PASSWORD = "123456";
const KEEP_USER_NAME = "周自强";
const KEEP_USER_PHONE = "18381330558";
const KEEP_ORG_NAME = "AI 教育科技";
const KEEP_CAMPUS_NAMES = ["总部校区", "西华大学"] as const;
const FORMAL_QUESTION_COUNT = 503;

const MODULES = [
  "dashboard",
  "crm",
  "student-service",
  "question-bank",
  "content",
  "analytics",
  "sop",
  "settings"
] as const;

const ROLE_MODULES: Record<Exclude<UserRole, "ADMIN">, Array<(typeof MODULES)[number]>> = {
  CAMPUS_MANAGER: ["dashboard", "crm", "student-service", "analytics", "sop", "content"],
  ADMISSIONS_COUNSELOR: ["dashboard", "crm", "student-service"],
  ACADEMIC_TEACHER: ["dashboard", "student-service", "question-bank", "content"],
  LECTURER: ["dashboard", "question-bank", "content"]
};

const CAMPUS_IDS = {
  cd: `${PREFIX}campus_chengdu`,
  ls: `${PREFIX}campus_leshan`
} as const;

const USER_SPECS = [
  { key: "cdManager", id: `${PREFIX}user_cd_manager`, name: `${PREFIX}成都校长`, phone: "19000000001", role: UserRole.CAMPUS_MANAGER, campus: "cd" },
  { key: "lsManager", id: `${PREFIX}user_ls_manager`, name: `${PREFIX}乐山校长`, phone: "19000000002", role: UserRole.CAMPUS_MANAGER, campus: "ls" },
  { key: "cdAssistant", id: `${PREFIX}user_cd_assistant`, name: `${PREFIX}成都校长助理`, phone: "19000000003", role: UserRole.ACADEMIC_TEACHER, campus: "cd" },
  { key: "cdSales", id: `${PREFIX}user_cd_sales`, name: `${PREFIX}成都招生老师`, phone: "19000000004", role: UserRole.ADMISSIONS_COUNSELOR, campus: "cd" },
  { key: "lsSales", id: `${PREFIX}user_ls_sales`, name: `${PREFIX}乐山招生老师`, phone: "19000000005", role: UserRole.ADMISSIONS_COUNSELOR, campus: "ls" },
  { key: "cdAcademic", id: `${PREFIX}user_cd_academic`, name: `${PREFIX}成都教务老师`, phone: "19000000006", role: UserRole.ACADEMIC_TEACHER, campus: "cd" },
  { key: "lsAcademic", id: `${PREFIX}user_ls_academic`, name: `${PREFIX}乐山教务老师`, phone: "19000000007", role: UserRole.ACADEMIC_TEACHER, campus: "ls" },
  { key: "cdLecturer", id: `${PREFIX}user_cd_lecturer`, name: `${PREFIX}成都授课老师`, phone: "19000000008", role: UserRole.LECTURER, campus: "cd" },
  { key: "lsLecturer", id: `${PREFIX}user_ls_lecturer`, name: `${PREFIX}乐山授课老师`, phone: "19000000009", role: UserRole.LECTURER, campus: "ls" }
] as const;

type Mode = "dry-run" | "execute" | "cleanup";
type UserKey = (typeof USER_SPECS)[number]["key"];
type UserMap = Record<UserKey, string>;

function parseMode(): Mode {
  const hasExecute = process.argv.includes("--execute");
  const hasCleanup = process.argv.includes("--cleanup");
  const hasDryRun = process.argv.includes("--dry-run");
  const selected = [hasExecute, hasCleanup, hasDryRun].filter(Boolean).length;
  if (selected > 1) throw new Error("请只传入 --dry-run、--execute、--cleanup 其中一个参数");
  if (hasCleanup) return "cleanup";
  if (hasExecute) return "execute";
  return "dry-run";
}

function prefixedWhere<T extends string = string>(): Prisma.StringFilter<T> {
  return { startsWith: PREFIX };
}

function fixedId(name: string) {
  return `${PREFIX}${name}`;
}

async function getRequiredBaseData() {
  const [org, admin, sopTemplate] = await Promise.all([
    prisma.organization.findFirst({ where: { name: KEEP_ORG_NAME }, select: { id: true, name: true } }),
    prisma.user.findFirst({
      where: { name: KEEP_USER_NAME, phone: KEEP_USER_PHONE, role: UserRole.ADMIN, status: UserStatus.ACTIVE },
      select: { id: true, name: true, phone: true, role: true, status: true }
    }),
    prisma.sopTemplate.findFirst({
      where: { title: { not: { startsWith: PREFIX } } },
      select: { id: true, title: true },
      orderBy: { createdAt: "asc" }
    })
  ]);
  if (!org) throw new Error(`未找到组织：${KEEP_ORG_NAME}`);
  if (!admin) throw new Error("未找到可保留的周自强 ADMIN/ACTIVE 账号");
  return { org, admin, sopTemplate };
}

async function countExistingV06Data() {
  const [
    campuses,
    users,
    campusAssistants,
    leads,
    leadFollowUps,
    students,
    classes,
    sessions,
    attendanceRecords,
    studyPlans,
    reminders,
    serviceTickets,
    wrongQuestionRecords,
    questionBanks,
    questions,
    examPapers,
    examPaperQuestions,
    teachingTemplates,
    teachingKeyPoints,
    teachingContents,
    teachingVersions,
    teachingPublications,
    sopExecutions,
    sopTasks,
    sopCheckIns,
    sopInspections,
    sopWeeklyReports
  ] = await Promise.all([
    prisma.campus.count({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }, { code: prefixedWhere() }] } }),
    prisma.user.count({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }, { phone: { startsWith: "190000000" } }] } }),
    prisma.campusAssistant.count({ where: { OR: [{ campusId: prefixedWhere() }, { userId: prefixedWhere() }] } }),
    prisma.lead.count({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }] } }),
    prisma.leadFollowUp.count({ where: { OR: [{ id: prefixedWhere() }, { content: prefixedWhere() }, { leadId: prefixedWhere() }] } }),
    prisma.student.count({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }] } }),
    prisma.studentClass.count({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }] } }),
    prisma.courseSession.count({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }] } }),
    prisma.attendanceRecord.count({ where: { OR: [{ id: prefixedWhere() }, { note: prefixedWhere() }, { studentId: prefixedWhere() }, { courseSessionId: prefixedWhere() }] } }),
    prisma.studyPlan.count({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }, { studentId: prefixedWhere() }] } }),
    prisma.studentReminder.count({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }, { studentId: prefixedWhere() }, { classId: prefixedWhere() }, { courseSessionId: prefixedWhere() }] } }),
    prisma.serviceTicket.count({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }, { studentId: prefixedWhere() }] } }),
    prisma.wrongQuestionRecord.count({ where: { OR: [{ id: prefixedWhere() }, { studentId: prefixedWhere() }, { questionId: prefixedWhere() }] } }),
    prisma.questionBank.count({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }] } }),
    prisma.question.count({ where: { OR: [{ id: prefixedWhere() }, { stem: prefixedWhere() }] } }),
    prisma.examPaper.count({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }] } }),
    prisma.examPaperQuestion.count({ where: { OR: [{ id: prefixedWhere() }, { paperId: prefixedWhere() }, { questionId: prefixedWhere() }] } }),
    prisma.teachingContentTemplate.count({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }] } }),
    prisma.teachingKeyPoint.count({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }] } }),
    prisma.teachingContent.count({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }] } }),
    prisma.teachingContentVersion.count({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }, { contentId: prefixedWhere() }] } }),
    prisma.teachingContentPublication.count({ where: { OR: [{ id: prefixedWhere() }, { contentId: prefixedWhere() }, { campusId: prefixedWhere() }] } }),
    prisma.sopExecution.count({ where: { OR: [{ id: prefixedWhere() }, { owner: prefixedWhere() }, { campusId: prefixedWhere() }] } }),
    prisma.sopTask.count({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }, { campusId: prefixedWhere() }, { sopExecutionId: prefixedWhere() }] } }),
    prisma.sopTaskCheckIn.count({ where: { OR: [{ id: prefixedWhere() }, { note: prefixedWhere() }, { taskId: prefixedWhere() }, { userId: prefixedWhere() }] } }),
    prisma.sopInspection.count({ where: { OR: [{ id: prefixedWhere() }, { sopExecutionId: prefixedWhere() }, { inspectorId: prefixedWhere() }] } }),
    prisma.sopWeeklyReport.count({ where: { OR: [{ id: prefixedWhere() }, { summary: prefixedWhere() }, { sopExecutionId: prefixedWhere() }, { campusId: prefixedWhere() }, { reporterId: prefixedWhere() }] } })
  ]);
  return {
    Campus: campuses,
    User: users,
    CampusAssistant: campusAssistants,
    Lead: leads,
    LeadFollowUp: leadFollowUps,
    Student: students,
    StudentClass: classes,
    CourseSession: sessions,
    AttendanceRecord: attendanceRecords,
    StudyPlan: studyPlans,
    StudentReminder: reminders,
    ServiceTicket: serviceTickets,
    WrongQuestionRecord: wrongQuestionRecords,
    QuestionBank: questionBanks,
    Question: questions,
    ExamPaper: examPapers,
    ExamPaperQuestion: examPaperQuestions,
    TeachingContentTemplate: teachingTemplates,
    TeachingKeyPoint: teachingKeyPoints,
    TeachingContent: teachingContents,
    TeachingContentVersion: teachingVersions,
    TeachingContentPublication: teachingPublications,
    SopExecution: sopExecutions,
    SopTask: sopTasks,
    SopTaskCheckIn: sopCheckIns,
    SopInspection: sopInspections,
    SopWeeklyReport: sopWeeklyReports
  };
}

async function buildDryRunPlan() {
  const [base, existing, keepCampusCount, formalQuestions, sopTemplateCount] = await Promise.all([
    getRequiredBaseData(),
    countExistingV06Data(),
    prisma.campus.count({ where: { name: { in: [...KEEP_CAMPUS_NAMES] } } }),
    prisma.question.count({ where: { NOT: { OR: [{ id: prefixedWhere() }, { stem: prefixedWhere() }] } } }),
    prisma.sopTemplate.count({ where: { title: { not: { startsWith: PREFIX } } } })
  ]);

  return {
    base,
    existing,
    planned: {
      Campus: 2,
      User: USER_SPECS.length,
      CampusAssistant: 1,
      RolePermissionUpsert: Object.keys(ROLE_MODULES).length * MODULES.length,
      Lead: 4,
      LeadFollowUp: 4,
      StudentClass: 2,
      Student: 4,
      CourseSession: 2,
      AttendanceRecord: 2,
      StudyPlan: 4,
      StudentReminder: 2,
      QuestionBank: 1,
      Question: 3,
      ExamPaper: 1,
      ExamPaperQuestion: 3,
      TeachingContentTemplate: 1,
      TeachingKeyPoint: 1,
      TeachingContent: 1,
      TeachingContentVersion: 1,
      TeachingContentPublication: 2,
      SopExecution: 2,
      SopTask: 2,
      SopTaskCheckIn: 2,
      SopWeeklyReport: 2
    },
    safety: {
      "周自强 ADMIN/ACTIVE": Boolean(base.admin),
      "总部校区/西华大学": keepCampusCount,
      "正式题目数量": formalQuestions,
      "正式SOP模板数量": sopTemplateCount,
      "可复用正式SOP模板": base.sopTemplate?.title || "无，将创建 V06_TEST_SOP模板"
    }
  };
}

async function upsertUser(spec: (typeof USER_SPECS)[number], organizationId: string, passwordHash: string) {
  const campusId = CAMPUS_IDS[spec.campus];
  const existing = await prisma.user.findFirst({
    where: { OR: [{ id: spec.id }, { phone: spec.phone }, { name: spec.name }] },
    select: { id: true }
  });
  const data = {
    organizationId,
    campusId,
    name: spec.name,
    phone: spec.phone,
    idNumber: null,
    passwordHash,
    role: spec.role,
    status: UserStatus.ACTIVE
  };
  if (existing) {
    return prisma.user.update({ where: { id: existing.id }, data });
  }
  return prisma.user.create({ data: { id: spec.id, ...data } });
}

async function upsertRolePermissions() {
  for (const [role, allowed] of Object.entries(ROLE_MODULES) as Array<[Exclude<UserRole, "ADMIN">, string[]]>) {
    for (const permissionModule of MODULES) {
      await prisma.rolePermission.upsert({
        where: { role_module: { role, module: permissionModule } },
        update: { enabled: allowed.includes(permissionModule) },
        create: { role, module: permissionModule, enabled: allowed.includes(permissionModule) }
      });
    }
  }
}

async function ensureSopTemplate() {
  const formal = await prisma.sopTemplate.findFirst({
    where: { title: { not: { startsWith: PREFIX } } },
    select: { id: true },
    orderBy: { createdAt: "asc" }
  });
  if (formal) return formal.id;
  const template = await prisma.sopTemplate.upsert({
    where: { id: fixedId("sop_template") },
    update: {},
    create: {
      id: fixedId("sop_template"),
      title: `${PREFIX}SOP模板`,
      module: `${PREFIX}权限测试`,
      category: "NEW_CAMPUS_LAUNCH",
      status: "ACTIVE",
      version: 1,
      summary: `${PREFIX}无正式SOP模板时的兜底测试模板`
    }
  });
  return template.id;
}

async function executeSeed() {
  const { org } = await getRequiredBaseData();
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await prisma.campus.upsert({
    where: { code: `${PREFIX}CD_DIRECT` },
    update: {
      id: CAMPUS_IDS.cd,
      organizationId: org.id,
      name: `${PREFIX}成都直营校区`,
      city: "成都",
      status: CampusStatus.ACTIVE,
      businessType: CampusBusinessType.DIRECT,
      contactPhone: "19000001001",
      address: `${PREFIX}成都测试地址`
    },
    create: {
      id: CAMPUS_IDS.cd,
      organizationId: org.id,
      name: `${PREFIX}成都直营校区`,
      code: `${PREFIX}CD_DIRECT`,
      city: "成都",
      status: CampusStatus.ACTIVE,
      businessType: CampusBusinessType.DIRECT,
      contactPhone: "19000001001",
      address: `${PREFIX}成都测试地址`
    }
  });

  await prisma.campus.upsert({
    where: { code: `${PREFIX}LS_FRANCHISE` },
    update: {
      id: CAMPUS_IDS.ls,
      organizationId: org.id,
      name: `${PREFIX}乐山加盟校区`,
      city: "乐山",
      status: CampusStatus.ACTIVE,
      businessType: CampusBusinessType.FRANCHISE,
      contactPhone: "19000001002",
      address: `${PREFIX}乐山测试地址`
    },
    create: {
      id: CAMPUS_IDS.ls,
      organizationId: org.id,
      name: `${PREFIX}乐山加盟校区`,
      code: `${PREFIX}LS_FRANCHISE`,
      city: "乐山",
      status: CampusStatus.ACTIVE,
      businessType: CampusBusinessType.FRANCHISE,
      contactPhone: "19000001002",
      address: `${PREFIX}乐山测试地址`
    }
  });

  const userMap = {} as UserMap;
  for (const spec of USER_SPECS) {
    const user = await upsertUser(spec, org.id, passwordHash);
    userMap[spec.key] = user.id;
  }

  await prisma.campus.update({
    where: { id: CAMPUS_IDS.cd },
    data: { managerId: userMap.cdManager }
  });
  await prisma.campus.update({
    where: { id: CAMPUS_IDS.ls },
    data: { managerId: userMap.lsManager }
  });
  await prisma.campusAssistant.upsert({
    where: { campusId_userId: { campusId: CAMPUS_IDS.cd, userId: userMap.cdAssistant } },
    update: {},
    create: { id: fixedId("campus_assistant_cd"), campusId: CAMPUS_IDS.cd, userId: userMap.cdAssistant }
  });

  await upsertRolePermissions();

  const classes = [
    { id: fixedId("class_cd"), campusId: CAMPUS_IDS.cd, name: `${PREFIX}成都班级`, academicOwnerId: userMap.cdAcademic, lecturerId: userMap.cdLecturer },
    { id: fixedId("class_ls"), campusId: CAMPUS_IDS.ls, name: `${PREFIX}乐山班级`, academicOwnerId: userMap.lsAcademic, lecturerId: userMap.lsLecturer }
  ];
  for (const item of classes) {
    await prisma.studentClass.upsert({
      where: { id: item.id },
      update: item,
      create: {
        ...item,
        startAt: new Date("2026-06-01T09:00:00+08:00"),
        classType: `${PREFIX}周末班`,
        examTrack: "PRIMARY"
      }
    });
  }

  const leads = [
    { id: fixedId("lead_cd_a"), campusId: CAMPUS_IDS.cd, creatorId: userMap.cdSales, assigneeId: userMap.cdSales, name: `${PREFIX}成都线索A`, phone: "19000002001", status: LeadStatus.UNCONTACTED },
    { id: fixedId("lead_cd_b"), campusId: CAMPUS_IDS.cd, creatorId: userMap.cdSales, assigneeId: userMap.cdSales, name: `${PREFIX}成都线索B`, phone: "19000002002", status: LeadStatus.WON },
    { id: fixedId("lead_ls_a"), campusId: CAMPUS_IDS.ls, creatorId: userMap.lsSales, assigneeId: userMap.lsSales, name: `${PREFIX}乐山线索A`, phone: "19000002003", status: LeadStatus.UNCONTACTED },
    { id: fixedId("lead_ls_b"), campusId: CAMPUS_IDS.ls, creatorId: userMap.lsSales, assigneeId: userMap.lsSales, name: `${PREFIX}乐山线索B`, phone: "19000002004", status: LeadStatus.WON }
  ];
  for (const item of leads) {
    await prisma.lead.upsert({
      where: { id: item.id },
      update: {
        campusId: item.campusId,
        creatorId: item.creatorId,
        assigneeId: item.assigneeId,
        name: item.name,
        phone: item.phone,
        status: item.status,
        sourceChannel: "OTHER",
        intentLevel: "HIGH",
        lastFollowedAt: new Date("2026-06-02T10:00:00+08:00")
      },
      create: {
        ...item,
        sourceChannel: "OTHER",
        intentLevel: "HIGH",
        examTrack: "PRIMARY",
        school: `${PREFIX}测试学校`,
        grade: "大三",
        major: "教育学",
        note: `${PREFIX}权限测试线索`,
        lastFollowedAt: new Date("2026-06-02T10:00:00+08:00")
      }
    });
    await prisma.leadFollowUp.upsert({
      where: { id: `${item.id}_followup` },
      update: {
        leadId: item.id,
        creatorId: item.creatorId,
        content: `${PREFIX}${item.name} 跟进记录`,
        status: item.status,
        intentLevel: "HIGH",
        followAt: new Date("2026-06-02T10:00:00+08:00")
      },
      create: {
        id: `${item.id}_followup`,
        leadId: item.id,
        creatorId: item.creatorId,
        content: `${PREFIX}${item.name} 跟进记录`,
        status: item.status,
        intentLevel: "HIGH",
        followAt: new Date("2026-06-02T10:00:00+08:00")
      }
    });
  }

  const students = [
    { id: fixedId("student_cd_a"), campusId: CAMPUS_IDS.cd, leadId: fixedId("lead_cd_b"), classId: fixedId("class_cd"), academicOwnerId: userMap.cdAcademic, salesOwnerId: userMap.cdSales, name: `${PREFIX}成都学员A`, phone: "19000003001" },
    { id: fixedId("student_cd_b"), campusId: CAMPUS_IDS.cd, leadId: null, classId: fixedId("class_cd"), academicOwnerId: userMap.cdAcademic, salesOwnerId: userMap.cdSales, name: `${PREFIX}成都学员B`, phone: "19000003002" },
    { id: fixedId("student_ls_a"), campusId: CAMPUS_IDS.ls, leadId: fixedId("lead_ls_b"), classId: fixedId("class_ls"), academicOwnerId: userMap.lsAcademic, salesOwnerId: userMap.lsSales, name: `${PREFIX}乐山学员A`, phone: "19000003003" },
    { id: fixedId("student_ls_b"), campusId: CAMPUS_IDS.ls, leadId: null, classId: fixedId("class_ls"), academicOwnerId: userMap.lsAcademic, salesOwnerId: userMap.lsSales, name: `${PREFIX}乐山学员B`, phone: "19000003004" }
  ];
  for (const item of students) {
    await prisma.student.upsert({
      where: { id: item.id },
      update: {
        campusId: item.campusId,
        leadId: item.leadId,
        classId: item.classId,
        academicOwnerId: item.academicOwnerId,
        salesOwnerId: item.salesOwnerId,
        name: item.name,
        phone: item.phone,
        studyStatus: "STUDYING"
      },
      create: {
        ...item,
        school: `${PREFIX}测试大学`,
        grade: "大三",
        major: "小学教育",
        classType: `${PREFIX}周末班`,
        examTrack: "PRIMARY",
        studyStatus: "STUDYING",
        serviceNote: `${PREFIX}权限测试学员`
      }
    });
    await prisma.studyPlan.upsert({
      where: { id: `${item.id}_plan` },
      update: { studentId: item.id, title: `${PREFIX}${item.name}学习计划`, progress: 35 },
      create: {
        id: `${item.id}_plan`,
        studentId: item.id,
        title: `${PREFIX}${item.name}学习计划`,
        aiSummary: `${PREFIX}用于验证教务数据范围`,
        planText: "每周完成综合素质练习并复盘错题。",
        serviceScript: "关注打卡、作业和阶段测评。",
        progress: 35
      }
    });
  }

  const sessions = [
    { id: fixedId("session_cd"), campusId: CAMPUS_IDS.cd, classId: fixedId("class_cd"), lecturerId: userMap.cdLecturer, title: `${PREFIX}成都课次`, studentId: fixedId("student_cd_a"), recorderId: userMap.cdAcademic },
    { id: fixedId("session_ls"), campusId: CAMPUS_IDS.ls, classId: fixedId("class_ls"), lecturerId: userMap.lsLecturer, title: `${PREFIX}乐山课次`, studentId: fixedId("student_ls_a"), recorderId: userMap.lsAcademic }
  ];
  for (const item of sessions) {
    await prisma.courseSession.upsert({
      where: { id: item.id },
      update: {
        campusId: item.campusId,
        classId: item.classId,
        lecturerId: item.lecturerId,
        title: item.title,
        startsAt: new Date("2026-06-08T19:00:00+08:00"),
        endsAt: new Date("2026-06-08T21:00:00+08:00")
      },
      create: {
        id: item.id,
        campusId: item.campusId,
        classId: item.classId,
        lecturerId: item.lecturerId,
        title: item.title,
        type: "LIVE",
        startsAt: new Date("2026-06-08T19:00:00+08:00"),
        endsAt: new Date("2026-06-08T21:00:00+08:00"),
        room: `${PREFIX}线上教室`,
        homework: `${PREFIX}完成课后练习`
      }
    });
    await prisma.attendanceRecord.upsert({
      where: { studentId_courseSessionId: { studentId: item.studentId, courseSessionId: item.id } },
      update: {
        recorderId: item.recorderId,
        status: "PRESENT",
        checkInAt: new Date("2026-06-08T18:55:00+08:00"),
        note: `${PREFIX}${item.title} 打卡`
      },
      create: {
        id: `${item.id}_attendance`,
        studentId: item.studentId,
        courseSessionId: item.id,
        recorderId: item.recorderId,
        status: "PRESENT",
        checkInAt: new Date("2026-06-08T18:55:00+08:00"),
        note: `${PREFIX}${item.title} 打卡`
      }
    });
    await prisma.studentReminder.upsert({
      where: { id: `${item.id}_reminder` },
      update: {
        studentId: item.studentId,
        classId: item.classId,
        courseSessionId: item.id,
        creatorId: item.recorderId,
        title: `${PREFIX}${item.title} 作业提醒`,
        scheduledAt: new Date("2026-06-09T20:00:00+08:00")
      },
      create: {
        id: `${item.id}_reminder`,
        studentId: item.studentId,
        classId: item.classId,
        courseSessionId: item.id,
        creatorId: item.recorderId,
        type: "HOMEWORK",
        title: `${PREFIX}${item.title} 作业提醒`,
        content: `${PREFIX}按时完成课后作业`,
        scheduledAt: new Date("2026-06-09T20:00:00+08:00")
      }
    });
  }

  const bank = await prisma.questionBank.upsert({
    where: { id: fixedId("question_bank") },
    update: { name: `${PREFIX}题库`, subject: QuestionSubject.COMPREHENSIVE_QUALITY, examTrack: "PRIMARY" },
    create: { id: fixedId("question_bank"), name: `${PREFIX}题库`, subject: QuestionSubject.COMPREHENSIVE_QUALITY, examTrack: "PRIMARY" }
  });
  await prisma.examPaper.upsert({
    where: { id: fixedId("exam_paper") },
    update: {
      questionBankId: bank.id,
      title: `${PREFIX}综合素质模拟卷`,
      questionCount: 3,
      status: "PUBLISHED",
      strategy: { prefix: PREFIX, purpose: "permission-test" }
    },
    create: {
      id: fixedId("exam_paper"),
      questionBankId: bank.id,
      title: `${PREFIX}综合素质模拟卷`,
      paperType: "MOCK",
      subject: QuestionSubject.COMPREHENSIVE_QUALITY,
      totalScore: 15,
      durationMinutes: 30,
      questionCount: 3,
      difficulty: "EASY",
      description: `${PREFIX}权限测试试卷`,
      status: "PUBLISHED",
      strategy: { prefix: PREFIX, purpose: "permission-test" }
    }
  });
  const questions = [
    { id: fixedId("question_single"), questionNo: "1", type: QuestionType.SINGLE_CHOICE, stem: `${PREFIX}题目_单选：教师职业理念强调什么？`, answer: "A", score: 2, options: { A: "以学生发展为本", B: "只看分数", C: "忽略差异", D: "机械训练" } },
    { id: fixedId("question_short"), questionNo: "2", type: QuestionType.SHORT_ANSWER, stem: `${PREFIX}题目_简答：简述因材施教的含义。`, answer: "根据学生差异实施教学。", score: 5, options: null },
    { id: fixedId("question_material"), questionNo: "3", type: QuestionType.MATERIAL_ANALYSIS, stem: `${PREFIX}题目_材料分析：分析教师如何支持学生发展。`, answer: "尊重差异，提供支持。", score: 8, options: null }
  ];
  for (const item of questions) {
    await prisma.question.upsert({
      where: { id: item.id },
      update: {
        questionBankId: bank.id,
        paperId: fixedId("exam_paper"),
        questionNo: item.questionNo,
        score: item.score,
        subject: QuestionSubject.COMPREHENSIVE_QUALITY,
        chapter: `${PREFIX}职业理念`,
        knowledgePoint: `${PREFIX}学生观`,
        type: item.type,
        stem: item.stem,
        options: item.options ?? Prisma.JsonNull,
        answer: item.answer,
        analysis: `${PREFIX}解析`,
        difficulty: 2,
        highFrequencyTags: [PREFIX],
        source: QuestionSource.ORIGINAL
      },
      create: {
        id: item.id,
        questionBankId: bank.id,
        paperId: fixedId("exam_paper"),
        questionNo: item.questionNo,
        score: item.score,
        subject: QuestionSubject.COMPREHENSIVE_QUALITY,
        chapter: `${PREFIX}职业理念`,
        knowledgePoint: `${PREFIX}学生观`,
        type: item.type,
        stem: item.stem,
        options: item.options ?? Prisma.JsonNull,
        answer: item.answer,
        analysis: `${PREFIX}解析`,
        difficulty: 2,
        highFrequencyTags: [PREFIX],
        source: QuestionSource.ORIGINAL
      }
    });
  }
  for (let index = 0; index < questions.length; index += 1) {
    const item = questions[index];
    await prisma.examPaperQuestion.upsert({
      where: { paperId_questionId: { paperId: fixedId("exam_paper"), questionId: item.id } },
      update: { sortOrder: index + 1, score: item.score },
      create: { id: `${PREFIX}paper_question_${index + 1}`, paperId: fixedId("exam_paper"), questionId: item.id, sortOrder: index + 1, score: item.score }
    });
  }

  await prisma.teachingContentTemplate.upsert({
    where: { id: fixedId("teaching_template") },
    update: {
      name: `${PREFIX}教研模板`,
      subject: `${PREFIX}综合素质`,
      chapter: `${PREFIX}职业理念`,
      type: TeachingContentType.COURSE_HANDOUT,
      enabled: true
    },
    create: {
      id: fixedId("teaching_template"),
      name: `${PREFIX}教研模板`,
      subject: `${PREFIX}综合素质`,
      chapter: `${PREFIX}职业理念`,
      type: TeachingContentType.COURSE_HANDOUT,
      structureMarkdown: "# 教学目标\n# 高频考点\n# 课堂练习",
      enabled: true
    }
  });
  await prisma.teachingKeyPoint.upsert({
    where: { id: fixedId("teaching_key_point") },
    update: { name: `${PREFIX}高频考点`, frequency: 5 },
    create: {
      id: fixedId("teaching_key_point"),
      subject: `${PREFIX}综合素质`,
      chapter: `${PREFIX}职业理念`,
      name: `${PREFIX}高频考点`,
      frequency: 5,
      questionTypes: "单选题、材料分析题",
      direction: "学生观与教师观",
      mistakes: "概念混淆",
      keywords: "学生发展、因材施教",
      note: `${PREFIX}权限测试考点`
    }
  });
  await prisma.teachingContent.upsert({
    where: { id: fixedId("teaching_content") },
    update: {
      authorId: userMap.cdAcademic,
      title: `${PREFIX}教研内容`,
      type: TeachingContentType.COURSE_HANDOUT,
      category: `${PREFIX}综合素质`,
      status: ContentStatus.PUBLISHED
    },
    create: {
      id: fixedId("teaching_content"),
      authorId: userMap.cdAcademic,
      title: `${PREFIX}教研内容`,
      type: TeachingContentType.COURSE_HANDOUT,
      category: `${PREFIX}综合素质`,
      status: ContentStatus.PUBLISHED,
      aiPrompt: `${PREFIX}权限测试提示词`,
      summary: `${PREFIX}用于校区素材权限验证`,
      body: "本内容用于验证教研中心和校区素材数据范围。",
      currentVersion: 1
    }
  });
  await prisma.teachingContentVersion.upsert({
    where: { contentId_version: { contentId: fixedId("teaching_content"), version: 1 } },
    update: { title: `${PREFIX}教研内容`, body: "本内容用于验证教研中心和校区素材数据范围。" },
    create: { id: fixedId("teaching_content_version_1"), contentId: fixedId("teaching_content"), version: 1, title: `${PREFIX}教研内容`, body: "本内容用于验证教研中心和校区素材数据范围。", changeNote: `${PREFIX}初始版本` }
  });
  for (const campusId of [CAMPUS_IDS.cd, CAMPUS_IDS.ls]) {
    await prisma.teachingContentPublication.upsert({
      where: { contentId_campusId: { contentId: fixedId("teaching_content"), campusId } },
      update: { publishedAt: new Date("2026-06-03T10:00:00+08:00") },
      create: { id: `${PREFIX}teaching_publication_${campusId === CAMPUS_IDS.cd ? "cd" : "ls"}`, contentId: fixedId("teaching_content"), campusId, publishedAt: new Date("2026-06-03T10:00:00+08:00") }
    });
  }

  const sopTemplateId = await ensureSopTemplate();
  const sopRows = [
    { id: fixedId("sop_execution_cd"), campusId: CAMPUS_IDS.cd, owner: `${PREFIX}SOP执行_成都`, taskId: fixedId("sop_task_cd"), taskTitle: `${PREFIX}成都SOP任务`, userId: userMap.cdManager },
    { id: fixedId("sop_execution_ls"), campusId: CAMPUS_IDS.ls, owner: `${PREFIX}SOP执行_乐山`, taskId: fixedId("sop_task_ls"), taskTitle: `${PREFIX}乐山SOP任务`, userId: userMap.lsManager }
  ];
  for (const item of sopRows) {
    await prisma.sopExecution.upsert({
      where: { id: item.id },
      update: { sopTemplateId, campusId: item.campusId, owner: item.owner, progress: 20 },
      create: { id: item.id, sopTemplateId, campusId: item.campusId, owner: item.owner, progress: 20 }
    });
    await prisma.sopTask.upsert({
      where: { id: item.taskId },
      update: {
        sopTemplateId,
        sopExecutionId: item.id,
        campusId: item.campusId,
        title: item.taskTitle,
        status: SopTaskStatus.IN_PROGRESS
      },
      create: {
        id: item.taskId,
        sopTemplateId,
        sopExecutionId: item.id,
        campusId: item.campusId,
        title: item.taskTitle,
        description: `${PREFIX}用于验证SOP数据范围`,
        status: SopTaskStatus.IN_PROGRESS,
        dueDate: new Date("2026-06-10T18:00:00+08:00")
      }
    });
    await prisma.sopTaskCheckIn.upsert({
      where: { id: `${item.taskId}_checkin` },
      update: { taskId: item.taskId, userId: item.userId, note: `${PREFIX}${item.taskTitle} 打卡` },
      create: { id: `${item.taskId}_checkin`, taskId: item.taskId, userId: item.userId, note: `${PREFIX}${item.taskTitle} 打卡` }
    });
    await prisma.sopWeeklyReport.upsert({
      where: { id: `${item.id}_weekly` },
      update: {
        sopTemplateId,
        sopExecutionId: item.id,
        campusId: item.campusId,
        reporterId: item.userId,
        summary: `${PREFIX}${item.owner} 周报`
      },
      create: {
        id: `${item.id}_weekly`,
        sopTemplateId,
        sopExecutionId: item.id,
        campusId: item.campusId,
        reporterId: item.userId,
        weekStart: new Date("2026-06-01T00:00:00+08:00"),
        summary: `${PREFIX}${item.owner} 周报`,
        blockers: "无",
        nextPlan: "继续推进测试流程",
        metrics: { leads: 2, students: 2, tasks: 1 }
      }
    });
  }
}

async function cleanupV06Data() {
  await prisma.$transaction([
    prisma.sopTaskCheckIn.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { note: prefixedWhere() }, { taskId: prefixedWhere() }, { userId: prefixedWhere() }] } }),
    prisma.sopInspection.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { sopExecutionId: prefixedWhere() }, { inspectorId: prefixedWhere() }] } }),
    prisma.sopWeeklyReport.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { summary: prefixedWhere() }, { sopExecutionId: prefixedWhere() }, { campusId: prefixedWhere() }, { reporterId: prefixedWhere() }] } }),
    prisma.sopTask.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }, { campusId: prefixedWhere() }, { sopExecutionId: prefixedWhere() }] } }),
    prisma.sopExecution.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { owner: prefixedWhere() }, { campusId: prefixedWhere() }] } }),
    prisma.studentReminder.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }, { studentId: prefixedWhere() }, { classId: prefixedWhere() }, { courseSessionId: prefixedWhere() }] } }),
    prisma.attendanceRecord.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { note: prefixedWhere() }, { studentId: prefixedWhere() }, { courseSessionId: prefixedWhere() }] } }),
    prisma.courseSession.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }] } }),
    prisma.studyPlan.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }, { studentId: prefixedWhere() }] } }),
    prisma.serviceTicket.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }, { studentId: prefixedWhere() }] } }),
    prisma.wrongQuestionRecord.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { studentId: prefixedWhere() }, { questionId: prefixedWhere() }] } }),
    prisma.student.updateMany({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }] }, data: { leadId: null, classId: null } }),
    prisma.student.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }] } }),
    prisma.leadFollowUp.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { content: prefixedWhere() }, { leadId: prefixedWhere() }] } }),
    prisma.lead.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }] } }),
    prisma.studentClass.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }] } }),
    prisma.teachingContentPublication.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { contentId: prefixedWhere() }, { campusId: prefixedWhere() }] } }),
    prisma.teachingContentExport.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { contentId: prefixedWhere() }, { fileName: prefixedWhere() }] } }),
    prisma.teachingContentReview.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { contentId: prefixedWhere() }, { reviewerId: prefixedWhere() }] } }),
    prisma.teachingContentVersion.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }, { contentId: prefixedWhere() }] } }),
    prisma.teachingContent.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }] } }),
    prisma.teachingContentTemplate.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }] } }),
    prisma.teachingKeyPoint.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }] } }),
    prisma.examPaperQuestion.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { paperId: prefixedWhere() }, { questionId: prefixedWhere() }] } }),
    prisma.question.updateMany({ where: { OR: [{ id: prefixedWhere() }, { stem: prefixedWhere() }] }, data: { paperId: null } }),
    prisma.question.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { stem: prefixedWhere() }] } }),
    prisma.examPaper.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }] } }),
    prisma.questionBank.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }] } }),
    prisma.campusAssistant.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { campusId: prefixedWhere() }, { userId: prefixedWhere() }] } }),
    prisma.userPermission.deleteMany({ where: { userId: prefixedWhere() } }),
    prisma.campus.updateMany({ where: { managerId: prefixedWhere() }, data: { managerId: null } }),
    prisma.user.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }, { phone: { startsWith: "190000000" } }] } }),
    prisma.campus.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { name: prefixedWhere() }, { code: prefixedWhere() }] } }),
    prisma.sopStep.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { sopTemplateId: prefixedWhere() }] } }),
    prisma.sopTemplate.deleteMany({ where: { OR: [{ id: prefixedWhere() }, { title: prefixedWhere() }] } })
  ]);
}

async function verifySeededData() {
  const users = await prisma.user.findMany({
    where: { id: { in: USER_SPECS.map((item) => item.id) } },
    select: { id: true, name: true, phone: true, role: true, status: true, campus: { select: { name: true } } },
    orderBy: { phone: "asc" }
  });
  const passwordChecks = await Promise.all(
    USER_SPECS.map(async (item) => {
      const user = await prisma.user.findUnique({ where: { id: item.id }, select: { passwordHash: true } });
      return Boolean(user && (await bcrypt.compare(DEFAULT_PASSWORD, user.passwordHash)));
    })
  );
  const [
    cdLeads,
    lsLeads,
    cdStudents,
    lsStudents,
    cdAttendance,
    lsAttendance,
    cdSopTasks,
    lsSopTasks,
    v06Questions,
    formalQuestions,
    formalSopTemplates,
    keepUser,
    keepCampuses,
    rolePermissionRows
  ] = await Promise.all([
    prisma.lead.count({ where: { campusId: CAMPUS_IDS.cd } }),
    prisma.lead.count({ where: { campusId: CAMPUS_IDS.ls } }),
    prisma.student.count({ where: { campusId: CAMPUS_IDS.cd } }),
    prisma.student.count({ where: { campusId: CAMPUS_IDS.ls } }),
    prisma.attendanceRecord.count({ where: { courseSession: { campusId: CAMPUS_IDS.cd } } }),
    prisma.attendanceRecord.count({ where: { courseSession: { campusId: CAMPUS_IDS.ls } } }),
    prisma.sopTask.count({ where: { campusId: CAMPUS_IDS.cd } }),
    prisma.sopTask.count({ where: { campusId: CAMPUS_IDS.ls } }),
    prisma.question.count({ where: { OR: [{ id: prefixedWhere() }, { stem: prefixedWhere() }] } }),
    prisma.question.count({ where: { NOT: { OR: [{ id: prefixedWhere() }, { stem: prefixedWhere() }] } } }),
    prisma.sopTemplate.count({ where: { title: { not: { startsWith: PREFIX } } } }),
    prisma.user.findFirst({ where: { name: KEEP_USER_NAME, phone: KEEP_USER_PHONE }, select: { role: true, status: true } }),
    prisma.campus.count({ where: { name: { in: [...KEEP_CAMPUS_NAMES] } } }),
    prisma.rolePermission.count()
  ]);

  return {
    users,
    counts: {
      "成都校区线索数": cdLeads,
      "乐山校区线索数": lsLeads,
      "成都校区学员数": cdStudents,
      "乐山校区学员数": lsStudents,
      "成都校区打卡数": cdAttendance,
      "乐山校区打卡数": lsAttendance,
      "成都校区SOP任务数": cdSopTasks,
      "乐山校区SOP任务数": lsSopTasks,
      "V06_TEST_题目数": v06Questions,
      "正式题目数量": formalQuestions,
      "正式SOP模板数量": formalSopTemplates,
      "RolePermission总数": rolePermissionRows
    },
    safety: {
      "测试账号默认密码可用": passwordChecks.every(Boolean),
      "周自强 ADMIN/ACTIVE": Boolean(keepUser && keepUser.role === UserRole.ADMIN && keepUser.status === UserStatus.ACTIVE),
      "总部校区/西华大学保留": keepCampuses
    },
    remainingV06: await countExistingV06Data()
  };
}

function printCounts(title: string, counts: Record<string, number | boolean | string>) {
  console.log(title);
  for (const [key, value] of Object.entries(counts)) {
    console.log(`- ${key}：${value}`);
  }
}

function printAccounts(users: Array<{ name: string; phone: string | null; role: UserRole; status: UserStatus; campus: { name: string } | null }>) {
  console.log("测试账号列表：");
  for (const user of users) {
    console.log(`- ${user.name} / ${user.phone || "-"} / ${user.role} / ${user.status} / ${user.campus?.name || "-"}`);
  }
  console.log(`默认密码：${DEFAULT_PASSWORD}`);
}

async function main() {
  const mode = parseMode();
  if (mode === "cleanup") {
    const before = await countExistingV06Data();
    printCounts("cleanup 前 V06_TEST_ 数据：", before);
    await cleanupV06Data();
    const after = await countExistingV06Data();
    printCounts("cleanup 后 V06_TEST_ 数据：", after);
    console.log(`是否存在未清理 V06_TEST_ 数据：${Object.values(after).some((count) => count > 0) ? "是" : "否"}`);
    return;
  }

  const plan = await buildDryRunPlan();
  console.log(`运行模式：${mode}`);
  console.log("脚本范围：创建或更新 V06_TEST_ 权限测试数据；不删除周自强、总部校区、西华大学、正式题库、正式SOP模板；不输出身份证号或 passwordHash。");
  printCounts("已存在 V06_TEST_ 数据：", plan.existing);
  printCounts("计划 upsert/创建数据：", plan.planned);
  printCounts("安全检查：", plan.safety);
  console.log("测试账号手机号：");
  for (const spec of USER_SPECS) console.log(`- ${spec.name} / ${spec.phone} / ${spec.role}`);
  console.log(`默认密码：${DEFAULT_PASSWORD}`);

  if (mode === "dry-run") {
    console.log("dry-run 完成：未写入数据库。传入 --execute 后才会生成测试数据。");
    return;
  }

  await executeSeed();
  const verification = await verifySeededData();
  console.log("execute 完成。");
  printCounts("创建/更新后验证计数：", verification.counts);
  printCounts("保留数据安全检查：", verification.safety);
  printAccounts(verification.users);
  console.log(`是否存在外键风险：${verification.counts["正式题目数量"] >= FORMAL_QUESTION_COUNT ? "否" : "是"}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
