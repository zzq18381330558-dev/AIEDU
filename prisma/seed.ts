import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { code: "AIEDU" },
    update: {},
    create: {
      name: "AI 教育科技",
      code: "AIEDU"
    }
  });

  const campus = await prisma.campus.upsert({
    where: { code: "HQ" },
    update: {
      city: "上海",
      contactPhone: "021-00000000",
      status: "ACTIVE"
    },
    create: {
      organizationId: org.id,
      name: "总部校区",
      code: "HQ",
      city: "上海",
      contactPhone: "021-00000000",
      address: "管理中心"
    }
  });

  const users = [
    ["管理员", "13800000000", null, UserRole.ADMIN],
    ["校区校长", "13800000001", "310101199001011001", UserRole.CAMPUS_MANAGER],
    ["招生老师", "13800000002", "310101199001011002", UserRole.ADMISSIONS_COUNSELOR],
    ["教务老师", "13800000003", "310101199001011003", UserRole.ACADEMIC_TEACHER],
    ["授课老师", "13800000004", "310101199001011004", UserRole.LECTURER]
  ] as const;

  async function upsertSeedUser(
    name: string,
    phone: string,
    idNumber: string | null,
    role: UserRole
  ) {
    const initialPassword = idNumber ? idNumber.slice(-6) : "123456";
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const existing = await prisma.user.findFirst({
      where: {
        organizationId: org.id,
        OR: [
          { phone },
          ...(idNumber ? [{ idNumber }] : [])
        ]
      }
    });

    if (existing) {
      return prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          phone,
          idNumber,
          passwordHash,
          role,
          status: "ACTIVE"
        }
      });
    }

    return prisma.user.create({
      data: {
        organizationId: org.id,
        campusId: campus.id,
        name,
        phone,
        idNumber,
        passwordHash,
        role
      }
    });
  }

  for (const [name, phone, idNumber, role] of users) {
    await upsertSeedUser(name, phone, idNumber, role);
  }

  const admin = await prisma.user.findFirstOrThrow({
    where: { organizationId: org.id, phone: "13800000000" }
  });
  const academic = await prisma.user.findFirstOrThrow({
    where: { organizationId: org.id, phone: "13800000003" }
  });
  const lecturer = await prisma.user.findFirstOrThrow({
    where: { organizationId: org.id, phone: "13800000004" }
  });
  const sales = await prisma.user.findFirstOrThrow({
    where: { organizationId: org.id, phone: "13800000002" }
  });

  await prisma.campus.update({
    where: { id: campus.id },
    data: { managerId: admin.id }
  });

  const dictionaries = [
    ["SCHOOL", "上海师范大学", "SHNU", 1],
    ["SCHOOL", "华东师范大学", "ECNU", 2],
    ["MAJOR", "汉语言文学", "CHINESE_LANGUAGE", 1],
    ["MAJOR", "小学教育", "PRIMARY_EDUCATION", 2],
    ["EXAM_TRACK", "幼儿", "INFANT", 1],
    ["EXAM_TRACK", "小学", "PRIMARY", 2],
    ["EXAM_TRACK", "中学", "MIDDLE", 3],
    ["LEAD_SOURCE", "高校合作", "UNIVERSITY_PARTNERSHIP", 1],
    ["LEAD_SOURCE", "地推", "GROUND_PROMOTION", 2],
    ["QUESTION_TYPE", "单选题", "SINGLE_CHOICE", 1],
    ["QUESTION_TYPE", "材料分析题", "MATERIAL_ANALYSIS", 2],
    ["DIFFICULTY", "基础", "1", 1],
    ["DIFFICULTY", "中等", "3", 2],
    ["CLASS_TYPE", "周末班", "WEEKEND", 1],
    ["CLASS_TYPE", "冲刺班", "SPRINT", 2]
  ] as const;

  for (const [category, name, value, sortOrder] of dictionaries) {
    await prisma.businessDictionary.upsert({
      where: {
        organizationId_category_name: {
          organizationId: org.id,
          category,
          name
        }
      },
      update: { value, sortOrder, enabled: true },
      create: {
        organizationId: org.id,
        category,
        name,
        value,
        sortOrder
      }
    });
  }

  const questionBank = await prisma.questionBank.upsert({
    where: { id: "seed-question-bank" },
    update: {},
    create: {
      id: "seed-question-bank",
      name: "教师资格证综合素质题库",
      subject: "COMPREHENSIVE_QUALITY",
      examTrack: "PRIMARY"
    }
  });

  const question1 = await prisma.question.upsert({
    where: { id: "seed-question-001" },
    update: {},
    create: {
      id: "seed-question-001",
      questionBankId: questionBank.id,
      subject: "COMPREHENSIVE_QUALITY",
      chapter: "职业理念",
      knowledgePoint: "学生观",
      type: "SINGLE_CHOICE",
      stem: "教师在教育教学中应当把学生看作发展中的人，这体现的学生观是（ ）。",
      options: [
        { key: "A", text: "学生是完整的人" },
        { key: "B", text: "学生是发展中的人" },
        { key: "C", text: "学生是独特的人" },
        { key: "D", text: "学生是被动接受者" }
      ],
      answer: "B",
      analysis: "题干强调发展潜能和成长过程，对应“学生是发展中的人”。",
      difficulty: 2,
      highFrequencyTags: ["学生观", "职业理念"],
      source: "REAL_EXAM",
      year: 2024
    }
  });

  const question2 = await prisma.question.upsert({
    where: { id: "seed-question-002" },
    update: {},
    create: {
      id: "seed-question-002",
      questionBankId: questionBank.id,
      subject: "COMPREHENSIVE_QUALITY",
      chapter: "教师职业道德",
      knowledgePoint: "关爱学生",
      type: "MATERIAL_ANALYSIS",
      stem: "材料：某教师对学习困难学生持续鼓励并提供个别辅导。请从教师职业道德角度评析该教师行为。",
      answer: "该教师体现了关爱学生、教书育人等职业道德要求。",
      analysis: "作答需先表明态度，再结合材料分析关爱学生、尊重学生、促进学生发展的具体体现。",
      difficulty: 3,
      highFrequencyTags: ["教师职业道德", "关爱学生"],
      source: "MOCK",
      year: 2026
    }
  });

  const question3 = await prisma.question.upsert({
    where: { id: "seed-question-003" },
    update: {},
    create: {
      id: "seed-question-003",
      subject: "EDUCATION_KNOWLEDGE",
      chapter: "学习心理",
      knowledgePoint: "学习动机",
      type: "SHORT_ANSWER",
      stem: "简述激发学生学习动机的常用策略。",
      answer: "创设问题情境、合理设置目标、及时反馈、归因训练、增强自我效能感等。",
      difficulty: 3,
      highFrequencyTags: ["学习动机", "教育心理学"],
      source: "ORIGINAL",
      year: 2026
    }
  });

  const seedContent = await prisma.teachingContent.upsert({
    where: { id: "seed-content" },
    update: {
      type: "COURSE_HANDOUT",
      summary: "综合素质核心模块、课时安排与练习任务",
      body: "一、职业理念\n二、教育法律法规\n三、教师职业道德\n四、文化素养\n五、基本能力"
    },
    create: {
      id: "seed-content",
      authorId: admin.id,
      title: "综合素质课程大纲",
      type: "COURSE_HANDOUT",
      category: "课程大纲",
      status: "PUBLISHED",
      summary: "综合素质核心模块、课时安排与练习任务",
      body: "一、职业理念\n二、教育法律法规\n三、教师职业道德\n四、文化素养\n五、基本能力",
      versions: {
        create: {
          version: 1,
          title: "综合素质课程大纲",
          body: "一、职业理念\n二、教育法律法规\n三、教师职业道德\n四、文化素养\n五、基本能力",
          changeNote: "初始化内容"
        }
      }
    }
  });

  await prisma.teachingContentPublication.upsert({
    where: { contentId_campusId: { contentId: seedContent.id, campusId: campus.id } },
    update: {},
    create: { contentId: seedContent.id, campusId: campus.id }
  });

  const seedSop = await prisma.sopTemplate.upsert({
    where: { id: "seed-sop" },
    update: {
      category: "NEW_CAMPUS_LAUNCH",
      summary: "新校区从招生账号、线索池、地推排期到首周复盘的启动流程。",
      document: "1. 总部确认校区启动目标。\n2. 校区完成招生账号、企微、社群和线索表准备。\n3. 首周执行地推、朋友圈和咨询转化动作。\n4. 每日提交任务打卡，每周提交经营周报。"
    },
    create: {
      id: "seed-sop",
      title: "新校区招生启动 SOP",
      module: "校区复制",
      category: "NEW_CAMPUS_LAUNCH",
      status: "ACTIVE",
      summary: "新校区从招生账号、线索池、地推排期到首周复盘的启动流程。",
      document: "1. 总部确认校区启动目标。\n2. 校区完成招生账号、企微、社群和线索表准备。\n3. 首周执行地推、朋友圈和咨询转化动作。\n4. 每日提交任务打卡，每周提交经营周报。",
      steps: {
        create: [
          { title: "搭建招生账号与线索池", standard: "企微、社群、线索表和分配规则齐备", ownerRole: "校区校长", sortOrder: 1 },
          { title: "完成首周地推与社群排期", standard: "明确点位、时间、物料、负责人和每日目标", ownerRole: "招生老师", sortOrder: 2 },
          { title: "复盘线索转化数据", standard: "输出来源、咨询、试听、成交和问题动作", ownerRole: "管理员", sortOrder: 3 }
        ]
      }
    }
  });

  const sopTemplates = [
    {
      id: "seed-sop-ground-promotion",
      title: "招生地推 SOP",
      module: "招生 SOP",
      category: "GROUND_PROMOTION" as const,
      summary: "规范校园地推点位选择、话术、扫码登记、线索分配和日复盘。",
      document: "地推前确认高校点位、物料、优惠口径和登记表；地推中按统一话术收集线索；地推后 2 小时内完成线索清洗和首次触达。",
      steps: ["确认高校点位与物料", "执行扫码登记与咨询引导", "当日线索清洗与分配", "复盘点位转化"]
    },
    {
      id: "seed-sop-class-service",
      title: "教务上课服务 SOP",
      module: "教务 SOP",
      category: "CLASS_SERVICE" as const,
      summary: "统一课前提醒、到课记录、作业布置、课后反馈和缺课跟进。",
      document: "课前 24 小时和 2 小时提醒；课中记录到课；课后同步作业与资料；缺课学员当天完成关怀和补课安排。",
      steps: ["发送课前提醒", "记录到课与迟到", "同步作业与资料", "缺课学员补课跟进"]
    },
    {
      id: "seed-sop-campus-agent",
      title: "校园代理 SOP",
      module: "高校合作",
      category: "UNIVERSITY_COOPERATION" as const,
      summary: "规范校园代理招募、培训、任务分配、线索结算和风险管理。",
      document: "代理招募需登记学校、年级、社群资源；总部统一培训话术和素材；线索按表单归因，按周复盘有效线索和转化。",
      steps: ["招募并登记校园代理", "完成代理培训", "分配社群与朋友圈任务", "按周核算线索质量"]
    },
    {
      id: "seed-sop-class-opening",
      title: "开班 SOP",
      module: "教务 SOP",
      category: "STUDENT_ONBOARDING" as const,
      summary: "开班前完成班级建档、学员入群、课表确认、资料发放和服务说明。",
      document: "开班前 3 天确认班级、老师、课表、教材和社群；开班当天完成服务规则说明；首课后收集学员问题。",
      steps: ["建立班级与学员名单", "确认课表和授课老师", "发放资料并完成入群", "首课后收集反馈"]
    },
    {
      id: "seed-sop-refund",
      title: "退费与投诉处理 SOP",
      module: "风控服务",
      category: "REFUND_COMPLAINT" as const,
      summary: "统一退费、投诉、服务补救和总部升级处理口径。",
      document: "收到退费或投诉后 2 小时内响应；先核实合同、上课和服务记录；提出补救方案；重大风险升级总部。",
      steps: ["登记退费或投诉原因", "核实合同与服务记录", "制定补救或退费方案", "总部复核并归档"]
    }
  ];

  for (const item of sopTemplates) {
    await prisma.sopTemplate.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        module: item.module,
        category: item.category,
        summary: item.summary,
        document: item.document,
        status: "ACTIVE"
      },
      create: {
        id: item.id,
        title: item.title,
        module: item.module,
        category: item.category,
        status: "ACTIVE",
        summary: item.summary,
        document: item.document,
        steps: {
          create: item.steps.map((title, index) => ({
            title,
            sortOrder: index + 1,
            ownerRole: index % 2 === 0 ? "校区校长" : "管理员"
          }))
        }
      }
    });
  }

  const sopExecution = await prisma.sopExecution.upsert({
    where: { id: "seed-sop-execution-hq" },
    update: { progress: 33 },
    create: {
      id: "seed-sop-execution-hq",
      sopTemplateId: seedSop.id,
      campusId: campus.id,
      owner: "校区校长",
      progress: 33
    }
  });

  await prisma.sopTask.upsert({
    where: { id: "seed-sop-task-001" },
    update: {},
    create: {
      id: "seed-sop-task-001",
      sopTemplateId: seedSop.id,
      sopExecutionId: sopExecution.id,
      campusId: campus.id,
      title: "完成首周高校点位排期",
      description: "至少确认 3 个高校点位，明确物料、人员和每日目标。",
      status: "IN_PROGRESS",
      dueDate: new Date("2026-06-03T18:00:00+08:00")
    }
  });

  const studentClass = await prisma.studentClass.upsert({
    where: { id: "seed-student-class-primary" },
    update: {},
    create: {
      id: "seed-student-class-primary",
      campusId: campus.id,
      name: "小学教资周末冲刺班",
      startAt: new Date("2026-06-01T09:00:00+08:00"),
      academicOwnerId: academic.id,
      lecturerId: lecturer.id,
      classType: "周末冲刺班",
      examTrack: "PRIMARY"
    }
  });

  const student = await prisma.student.upsert({
    where: { id: "seed-student-001" },
    update: {},
    create: {
      id: "seed-student-001",
      campusId: campus.id,
      classId: studentClass.id,
      academicOwnerId: academic.id,
      salesOwnerId: sales.id,
      name: "林小雅",
      phone: "13800001111",
      school: "上海师范大学",
      grade: "大三",
      major: "汉语言文学",
      classType: "周末冲刺班",
      examTrack: "PRIMARY",
      studyStatus: "STUDYING",
      serviceNote: "基础较好，作文需要重点跟进。"
    }
  });

  const session = await prisma.courseSession.upsert({
    where: { id: "seed-course-session-001" },
    update: {},
    create: {
      id: "seed-course-session-001",
      campusId: campus.id,
      classId: studentClass.id,
      lecturerId: lecturer.id,
      title: "综合素质材料分析专项课",
      type: "LIVE",
      startsAt: new Date("2026-06-06T19:00:00+08:00"),
      endsAt: new Date("2026-06-06T21:00:00+08:00"),
      room: "腾讯会议",
      homework: "完成材料分析真题 2 组，提交错题截图。"
    }
  });

  await prisma.attendanceRecord.upsert({
    where: {
      studentId_courseSessionId: {
        studentId: student.id,
        courseSessionId: session.id
      }
    },
    update: {},
    create: {
      studentId: student.id,
      courseSessionId: session.id,
      recorderId: academic.id,
      status: "PRESENT",
      checkInAt: new Date("2026-06-06T18:58:00+08:00"),
      note: "准时到课"
    }
  });

  await prisma.studentReminder.upsert({
    where: { id: "seed-reminder-001" },
    update: {},
    create: {
      id: "seed-reminder-001",
      studentId: student.id,
      classId: studentClass.id,
      courseSessionId: session.id,
      creatorId: academic.id,
      type: "HOMEWORK",
      title: "作业提醒",
      content: "今晚 22:00 前提交材料分析专项课作业。",
      scheduledAt: new Date("2026-06-07T20:00:00+08:00")
    }
  });

  const paper = await prisma.examPaper.upsert({
    where: { id: "seed-paper-001" },
    update: {},
    create: {
      id: "seed-paper-001",
      questionBankId: questionBank.id,
      title: "综合素质高频考点练习卷",
      subject: "COMPREHENSIVE_QUALITY",
      totalScore: 20,
      durationMinutes: 30,
      status: "DRAFT",
      questions: {
        create: [
          { questionId: question1.id, sortOrder: 1, score: 2 },
          { questionId: question2.id, sortOrder: 2, score: 8 }
        ]
      }
    }
  });

  await prisma.wrongQuestionRecord.upsert({
    where: { id: "seed-wrong-question-001" },
    update: {},
    create: {
      id: "seed-wrong-question-001",
      studentId: student.id,
      questionId: question1.id,
      answer: "A",
      reason: "混淆了完整的人和发展中的人",
      mastered: false
    }
  });

  await prisma.examPaperQuestion.upsert({
    where: {
      paperId_questionId: {
        paperId: paper.id,
        questionId: question3.id
      }
    },
    update: {},
    create: {
      paperId: paper.id,
      questionId: question3.id,
      sortOrder: 3,
      score: 5
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
