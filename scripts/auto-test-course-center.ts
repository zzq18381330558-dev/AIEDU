import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import {
  PrismaClient,
  type Course,
  UserRole
} from "@prisma/client";
import { canAccess } from "../src/lib/roles";
import { canManageCourse, normalizeChapterInput, normalizeCourseInput, normalizeLessonInput } from "../src/lib/courses";
import { buildCourseScopeWhere, canAccessCampusId, type DataScopeUser } from "../src/lib/data-scope";
import { normalizeClassInput, validateClassCourse } from "../src/lib/student-service";

const prisma = new PrismaClient();
const PREFIX = "V07_AUTO_TEST_";
const DEFAULT_PASSWORD = "123456";

type Mode = "dry-run" | "execute" | "cleanup";
type TestUserKey = "admin" | "chengduManager" | "leshanManager" | "academic" | "lecturer" | "sales";

type TestContext = {
  organizationId: string;
  campuses: { chengdu: string; leshan: string };
  users: Record<TestUserKey, DataScopeUser>;
};

type CourseSet = {
  courseA: Course;
  courseB: Course;
  hqCourse: Course;
};

function parseMode(): Mode {
  const execute = process.argv.includes("--execute");
  const cleanup = process.argv.includes("--cleanup");
  const dryRun = process.argv.includes("--dry-run");
  const selected = [execute, cleanup, dryRun].filter(Boolean).length;
  if (selected > 1) throw new Error("请只传入 --execute、--cleanup、--dry-run 其中一个参数");
  if (execute) return "execute";
  if (cleanup) return "cleanup";
  return "dry-run";
}

function startsWithPrefix() {
  return { startsWith: PREFIX };
}

async function countV07Data() {
  const [
    organizations,
    campuses,
    users,
    courses,
    chapters,
    lessons,
    contents,
    contentVersions,
    papers,
    classes
  ] = await Promise.all([
    prisma.organization.count({ where: { OR: [{ name: startsWithPrefix() }, { code: startsWithPrefix() }] } }),
    prisma.campus.count({ where: { OR: [{ name: startsWithPrefix() }, { code: startsWithPrefix() }] } }),
    prisma.user.count({ where: { name: startsWithPrefix() } }),
    prisma.course.count({ where: { OR: [{ name: startsWithPrefix() }, { code: startsWithPrefix() }] } }),
    prisma.courseChapter.count({ where: { title: startsWithPrefix() } }),
    prisma.courseLesson.count({ where: { title: startsWithPrefix() } }),
    prisma.teachingContent.count({ where: { title: startsWithPrefix() } }),
    prisma.teachingContentVersion.count({ where: { title: startsWithPrefix() } }),
    prisma.examPaper.count({ where: { title: startsWithPrefix() } }),
    prisma.studentClass.count({ where: { name: startsWithPrefix() } })
  ]);
  return { organizations, campuses, users, courses, chapters, lessons, contents, contentVersions, papers, classes };
}

async function cleanupV07Data() {
  const prefixUserIds = (await prisma.user.findMany({ where: { name: startsWithPrefix() }, select: { id: true } })).map(
    (item) => item.id
  );
  const prefixCampusIds = (
    await prisma.campus.findMany({ where: { OR: [{ name: startsWithPrefix() }, { code: startsWithPrefix() }] }, select: { id: true } })
  ).map((item) => item.id);
  const prefixCourseIds = (
    await prisma.course.findMany({ where: { OR: [{ name: startsWithPrefix() }, { code: startsWithPrefix() }] }, select: { id: true } })
  ).map((item) => item.id);
  const prefixContentIds = (
    await prisma.teachingContent.findMany({ where: { title: startsWithPrefix() }, select: { id: true } })
  ).map((item) => item.id);
  const prefixPaperIds = (await prisma.examPaper.findMany({ where: { title: startsWithPrefix() }, select: { id: true } })).map(
    (item) => item.id
  );

  await prisma.$transaction([
    prisma.attendanceRecord.deleteMany({ where: { courseSession: { class: { name: startsWithPrefix() } } } }),
    prisma.studentReminder.deleteMany({ where: { class: { name: startsWithPrefix() } } }),
    prisma.courseSession.deleteMany({ where: { class: { name: startsWithPrefix() } } }),
    prisma.studentClass.deleteMany({ where: { name: startsWithPrefix() } }),
    prisma.courseLesson.deleteMany({
      where: { OR: [{ title: startsWithPrefix() }, { chapter: { courseId: { in: prefixCourseIds } } }] }
    }),
    prisma.courseChapter.deleteMany({ where: { OR: [{ title: startsWithPrefix() }, { courseId: { in: prefixCourseIds } }] } }),
    prisma.course.deleteMany({ where: { id: { in: prefixCourseIds } } }),
    prisma.teachingContentExport.deleteMany({ where: { contentId: { in: prefixContentIds } } }),
    prisma.teachingContentPublication.deleteMany({ where: { contentId: { in: prefixContentIds } } }),
    prisma.teachingContentReview.deleteMany({ where: { contentId: { in: prefixContentIds } } }),
    prisma.teachingContentVersion.deleteMany({ where: { OR: [{ title: startsWithPrefix() }, { contentId: { in: prefixContentIds } }] } }),
    prisma.teachingContent.deleteMany({ where: { id: { in: prefixContentIds } } }),
    prisma.examPaperQuestion.deleteMany({ where: { paperId: { in: prefixPaperIds } } }),
    prisma.examPaper.deleteMany({ where: { id: { in: prefixPaperIds } } }),
    prisma.campusAssistant.deleteMany({ where: { OR: [{ campusId: { in: prefixCampusIds } }, { userId: { in: prefixUserIds } }] } }),
    prisma.userPermission.deleteMany({ where: { userId: { in: prefixUserIds } } }),
    prisma.campus.updateMany({ where: { managerId: { in: prefixUserIds } }, data: { managerId: null } }),
    prisma.user.deleteMany({ where: { id: { in: prefixUserIds } } }),
    prisma.campus.deleteMany({ where: { id: { in: prefixCampusIds } } }),
    prisma.organization.deleteMany({ where: { OR: [{ name: startsWithPrefix() }, { code: startsWithPrefix() }] } })
  ]);
}

async function createContext(): Promise<TestContext> {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 4);
  const org = await prisma.organization.create({
    data: { name: `${PREFIX}组织`, code: `${PREFIX}ORG` }
  });
  const [chengdu, leshan] = await Promise.all([
    prisma.campus.create({
      data: {
        organizationId: org.id,
        name: `${PREFIX}成都校区`,
        code: `${PREFIX}CD`,
        city: "成都",
        status: "ACTIVE"
      }
    }),
    prisma.campus.create({
      data: {
        organizationId: org.id,
        name: `${PREFIX}乐山校区`,
        code: `${PREFIX}LS`,
        city: "乐山",
        status: "ACTIVE"
      }
    })
  ]);

  const createdUsers = await Promise.all([
    createUser(org.id, null, `${PREFIX}管理员`, "19907070001", UserRole.ADMIN, passwordHash),
    createUser(org.id, chengdu.id, `${PREFIX}成都校长`, "19907070002", UserRole.CAMPUS_MANAGER, passwordHash),
    createUser(org.id, leshan.id, `${PREFIX}乐山校长`, "19907070003", UserRole.CAMPUS_MANAGER, passwordHash),
    createUser(org.id, chengdu.id, `${PREFIX}教务老师`, "19907070004", UserRole.ACADEMIC_TEACHER, passwordHash),
    createUser(org.id, chengdu.id, `${PREFIX}授课老师`, "19907070005", UserRole.LECTURER, passwordHash),
    createUser(org.id, chengdu.id, `${PREFIX}招生老师`, "19907070006", UserRole.ADMISSIONS_COUNSELOR, passwordHash)
  ]);

  await Promise.all([
    prisma.campus.update({ where: { id: chengdu.id }, data: { managerId: createdUsers[1].id } }),
    prisma.campus.update({ where: { id: leshan.id }, data: { managerId: createdUsers[2].id } })
  ]);

  return {
    organizationId: org.id,
    campuses: { chengdu: chengdu.id, leshan: leshan.id },
    users: {
      admin: toScopeUser(createdUsers[0]),
      chengduManager: toScopeUser(createdUsers[1]),
      leshanManager: toScopeUser(createdUsers[2]),
      academic: toScopeUser(createdUsers[3]),
      lecturer: toScopeUser(createdUsers[4]),
      sales: toScopeUser(createdUsers[5])
    }
  };
}

async function createUser(
  organizationId: string,
  campusId: string | null,
  name: string,
  phone: string,
  role: UserRole,
  passwordHash: string
) {
  return prisma.user.create({
    data: { organizationId, campusId, name, phone, role, passwordHash, status: "ACTIVE" },
    select: { id: true, name: true, role: true, campusId: true, organizationId: true }
  });
}

function toScopeUser(user: { id: string; role: UserRole; campusId: string | null; organizationId: string }): DataScopeUser {
  return { id: user.id, role: user.role, campusId: user.campusId, organizationId: user.organizationId };
}

async function assertMenuPermissions() {
  assert.equal(canAccess("ADMIN", "/courses"), true, "ADMIN 可见课程中心");
  assert.equal(canAccess("CAMPUS_MANAGER", "/courses"), true, "CAMPUS_MANAGER 可见课程中心");
  assert.equal(canAccess("ACADEMIC_TEACHER", "/courses"), true, "ACADEMIC_TEACHER 可见课程中心");
  assert.equal(canAccess("LECTURER", "/courses"), true, "LECTURER 可见课程中心");
  assert.equal(canAccess("ADMISSIONS_COUNSELOR", "/courses"), false, "ADMISSIONS_COUNSELOR 不可见课程中心");

  assert.equal(canManageCourse("ADMIN"), true, "ADMIN 可维护课程");
  assert.equal(canManageCourse("CAMPUS_MANAGER"), true, "CAMPUS_MANAGER 可维护课程");
  assert.equal(canManageCourse("ACADEMIC_TEACHER"), false, "ACADEMIC_TEACHER 只读");
  assert.equal(canManageCourse("LECTURER"), false, "LECTURER 只读");
}

async function assertCourseCrud(ctx: TestContext): Promise<CourseSet> {
  const courseA = await createCourse(ctx.users.admin, {
    campusId: ctx.campuses.chengdu,
    name: `${PREFIX}课程A`,
    code: `${PREFIX}COURSE_A`
  });
  assert.equal(courseA.name, `${PREFIX}课程A`);

  const editedCourseA = await prisma.course.update({
    where: { id: courseA.id },
    data: { name: `${PREFIX}课程A_已编辑`, price: 199 },
    include: { campus: true }
  });
  assert.equal(editedCourseA.name, `${PREFIX}课程A_已编辑`, "ADMIN 可编辑课程");

  const disabled = await prisma.course.update({ where: { id: courseA.id }, data: { status: "DISABLED" } });
  assert.equal(disabled.status, "DISABLED", "ADMIN 可停用课程");
  const enabled = await prisma.course.update({ where: { id: courseA.id }, data: { status: "ACTIVE" } });
  assert.equal(enabled.status, "ACTIVE", "ADMIN 可启用课程");

  assert.equal(await canAccessCampusId(ctx.users.chengduManager, ctx.campuses.chengdu, { activeOnly: true }), true);
  assert.equal(await canAccessCampusId(ctx.users.chengduManager, ctx.campuses.leshan, { activeOnly: true }), false);

  const courseB = await createCourse(ctx.users.chengduManager, {
    campusId: ctx.campuses.chengdu,
    name: `${PREFIX}课程B`,
    code: `${PREFIX}COURSE_B`
  });
  assert.equal(courseB.campusId, ctx.campuses.chengdu, "校区校长可创建本校课程");

  const chengduScopeCanFindCourseB = await prisma.course.findFirst({
    where: { AND: [{ id: courseB.id }, await buildCourseScopeWhere(ctx.users.chengduManager)] }
  });
  assert.ok(chengduScopeCanFindCourseB, "校区校长可编辑本校课程");
  const leshanScopeCanFindCourseB = await prisma.course.findFirst({
    where: { AND: [{ id: courseB.id }, await buildCourseScopeWhere(ctx.users.leshanManager)] }
  });
  assert.equal(leshanScopeCanFindCourseB, null, "校区校长不能编辑其他校区课程");

  const hqCourse = await createCourse(ctx.users.admin, {
    campusId: null,
    name: `${PREFIX}总部课程`,
    code: `${PREFIX}HQ_COURSE`
  });
  assert.equal(hqCourse.campusId, null, "ADMIN 可创建总部课程");

  return { courseA: enabled, courseB, hqCourse };
}

async function createCourse(user: DataScopeUser, input: { campusId: string | null; name: string; code: string }) {
  const data = normalizeCourseInput(
    {
      ...input,
      category: "教师资格证",
      examTrack: "PRIMARY",
      price: "99",
      status: "ACTIVE",
      isPublished: "true"
    },
    { organizationId: user.organizationId, createdById: user.id }
  );
  return prisma.course.create({ data });
}

async function assertChaptersAndLessons(ctx: TestContext, courses: CourseSet) {
  const chapter = await prisma.courseChapter.create({
    data: {
      courseId: courses.courseA.id,
      ...normalizeChapterInput({ title: `${PREFIX}章节`, description: "自动验收章节", sortOrder: "1" })
    }
  });
  const editedChapter = await prisma.courseChapter.update({
    where: { id: chapter.id },
    data: normalizeChapterInput({ title: `${PREFIX}章节_已编辑`, description: "自动验收章节更新", sortOrder: "2" })
  });
  assert.equal(editedChapter.courseId, courses.courseA.id, "章节归属课程正确");
  assert.equal(editedChapter.sortOrder, 2, "章节排序保存正常");

  const [content, paper] = await Promise.all([
    prisma.teachingContent.create({
      data: {
        authorId: ctx.users.academic.id,
        title: `${PREFIX}教研内容`,
        type: "COURSE_HANDOUT",
        category: "教师资格证",
        status: "APPROVED",
        summary: "自动验收教研内容",
        body: "自动验收内容正文"
      }
    }),
    prisma.examPaper.create({
      data: {
        title: `${PREFIX}试卷`,
        paperType: "MOCK",
        subject: "COMPREHENSIVE_QUALITY",
        totalScore: 100,
        durationMinutes: 120,
        questionCount: 0,
        status: "PUBLISHED"
      }
    })
  ]);
  await prisma.teachingContentVersion.create({
    data: { contentId: content.id, version: 1, title: content.title, body: content.body || "", changeNote: "V0.7 自动验收" }
  });

  const lesson = await prisma.courseLesson.create({
    data: normalizeLessonInput({
      chapterId: chapter.id,
      title: `${PREFIX}课时`,
      summary: "自动验收课时",
      durationMinutes: "45",
      sortOrder: "1",
      teachingContentId: content.id,
      questionPaperId: paper.id
    })
  });
  assert.equal(lesson.chapterId, chapter.id, "课时归属章节正确");
  assert.equal(lesson.durationMinutes, 45, "durationMinutes 保存正常");

  const editedLesson = await prisma.courseLesson.update({
    where: { id: lesson.id },
    data: {
      title: `${PREFIX}课时_已编辑`,
      summary: "自动验收课时更新",
      durationMinutes: 60,
      sortOrder: 3,
      teachingContentId: null,
      questionPaperId: paper.id
    }
  });
  assert.equal(editedLesson.sortOrder, 3, "课时排序保存正常");
  assert.equal(editedLesson.durationMinutes, 60, "课时编辑保存正常");
  assert.equal(editedLesson.teachingContentId, null, "修改 TeachingContent 绑定后保存正常");
  assert.equal(editedLesson.questionPaperId, paper.id, "ExamPaper 绑定保存正常");

  const reboundLesson = await prisma.courseLesson.update({
    where: { id: lesson.id },
    data: { teachingContentId: content.id }
  });
  assert.equal(reboundLesson.teachingContentId, content.id, "课时可绑定 TeachingContent");

  return { chapter: editedChapter, lesson: reboundLesson };
}

async function assertClassCourseBindings(ctx: TestContext, courses: CourseSet) {
  assert.throws(
    () => normalizeClassInput({ name: `${PREFIX}班级`, campusId: ctx.campuses.chengdu, startAt: "2026-06-01T09:00" }, { campusId: "" }),
    /请选择课程/,
    "新建班级不传 courseId 返回中文错误"
  );

  await prisma.course.update({ where: { id: courses.courseA.id }, data: { status: "DISABLED" } });
  await assert.rejects(
    () => validateClassCourse(ctx.users.admin, ctx.campuses.chengdu, courses.courseA.id),
    /课程不存在或已停用/,
    "停用课程不可被班级使用"
  );
  await prisma.course.update({ where: { id: courses.courseA.id }, data: { status: "ACTIVE" } });

  await assert.rejects(
    () => validateClassCourse(ctx.users.admin, ctx.campuses.leshan, courses.courseB.id),
    /班级课程必须属于所选校区，或选择总部课程/,
    "课程校区与班级校区不匹配时返回中文错误"
  );

  await validateClassCourse(ctx.users.chengduManager, ctx.campuses.chengdu, courses.courseB.id);
  const classInput = normalizeClassInput(
    {
      name: `${PREFIX}班级`,
      campusId: ctx.campuses.chengdu,
      courseId: courses.courseB.id,
      startAt: "2026-06-01T09:00",
      academicOwnerId: ctx.users.academic.id,
      lecturerId: ctx.users.lecturer.id
    },
    { campusId: ctx.campuses.chengdu }
  );
  const studentClass = await prisma.studentClass.create({ data: classInput });
  assert.equal(studentClass.courseId, courses.courseB.id, "新建班级必须传 courseId 且保存正常");

  await validateClassCourse(ctx.users.chengduManager, ctx.campuses.chengdu, courses.hqCourse.id);
  const editedClass = await prisma.studentClass.update({
    where: { id: studentClass.id },
    data: { courseId: courses.hqCourse.id }
  });
  assert.equal(editedClass.courseId, courses.hqCourse.id, "总部课程 campusId=null 可被校区班级使用，编辑班级可修改 courseId");

  return editedClass;
}

async function assertApiAuthorization(ctx: TestContext, courses: CourseSet) {
  assert.equal(canAccess("ADMISSIONS_COUNSELOR", "/courses"), false, "招生老师访问 /api/courses 应返回 403");
  assert.equal(canManageCourse("ACADEMIC_TEACHER"), false, "教务老师 POST /api/courses 应返回 403");
  assert.equal(canManageCourse("LECTURER"), false, "授课老师 POST /api/courses 应返回 403");
  const crossCampusCourse = await prisma.course.findFirst({
    where: { AND: [{ id: courses.courseB.id }, await buildCourseScopeWhere(ctx.users.leshanManager)] }
  });
  assert.equal(crossCampusCourse, null, "校区校长跨校区编辑课程应返回 403 或 404");
}

function printCounts(title: string, counts: Record<string, number>) {
  console.log(title);
  for (const [key, value] of Object.entries(counts)) console.log(`- ${key}: ${value}`);
}

async function executeAcceptance() {
  await cleanupV07Data();
  const ctx = await createContext();
  await assertMenuPermissions();
  const courses = await assertCourseCrud(ctx);
  await assertChaptersAndLessons(ctx, courses);
  await assertClassCourseBindings(ctx, courses);
  await assertApiAuthorization(ctx, courses);
  return countV07Data();
}

async function main() {
  const mode = parseMode();
  const before = await countV07Data();
  console.log(`运行模式: ${mode}`);
  console.log("安全边界: 仅创建/验证/清理 V07_AUTO_TEST_ 前缀数据；不输出 passwordHash；不输出身份证号。");
  printCounts("当前 V07_AUTO_TEST_ 数据:", before);

  if (mode === "dry-run") {
    console.log("dry-run 完成: 未写入数据库。执行 npx tsx scripts/auto-test-course-center.ts --execute 可创建测试数据并验收。");
    return;
  }

  if (mode === "cleanup") {
    await cleanupV07Data();
    printCounts("cleanup 后 V07_AUTO_TEST_ 数据:", await countV07Data());
    return;
  }

  const after = await executeAcceptance();
  printCounts("execute 后 V07_AUTO_TEST_ 数据:", after);
  console.log("V0.7 课程中心基础闭环自动验收通过。");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
