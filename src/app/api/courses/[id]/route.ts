import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import {
  canManageCourse,
  courseInclude,
  normalizeChapterInput,
  normalizeChapterUpdateInput,
  normalizeCourseUpdateInput,
  normalizeLessonInput,
  normalizeLessonUpdateInput,
  toCourseDto
} from "@/lib/courses";
import { buildAccessibleCampusWhere, buildCourseScopeWhere, canAccessCampusId } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

async function findCourse(id: string, user: Parameters<typeof buildCourseScopeWhere>[0]) {
  return prisma.course.findFirst({
    where: { AND: [{ id, deletedAt: null }, await buildCourseScopeWhere(user)] },
    include: courseInclude
  });
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/courses");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  const item = await findCourse(id, auth.user);
  if (!item) return NextResponse.json({ error: "课程不存在" }, { status: 404 });
  return NextResponse.json({ item: toCourseDto(item) });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/courses");
  if ("response" in auth) return auth.response;
  if (!canManageCourse(auth.user.role)) return NextResponse.json({ error: "无权维护课程" }, { status: 403 });
  const { id } = await context.params;

  try {
    const exists = await prisma.course.findFirst({
      where: { AND: [{ id, deletedAt: null }, await buildCourseScopeWhere(auth.user)] },
      select: { id: true, campusId: true }
    });
    if (!exists) return NextResponse.json({ error: "课程不存在" }, { status: 404 });

    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "course:update";
    if (action === "chapter:create") {
      await prisma.courseChapter.create({ data: { courseId: id, ...normalizeChapterInput(body) } });
    } else if (action === "chapter:update") {
      const chapterId = typeof body.chapterId === "string" ? body.chapterId.trim() : "";
      if (!chapterId) throw new Error("请选择要编辑的章节");
      const chapter = await prisma.courseChapter.findFirst({ where: { id: chapterId, courseId: id }, select: { id: true } });
      if (!chapter) return NextResponse.json({ error: "章节不存在或无权限" }, { status: 404 });
      await prisma.courseChapter.update({ where: { id: chapterId }, data: normalizeChapterUpdateInput(body) });
    } else if (action === "lesson:create") {
      const lesson = normalizeLessonInput(body);
      const chapter = await prisma.courseChapter.findFirst({ where: { id: lesson.chapterId, courseId: id }, select: { id: true } });
      if (!chapter) throw new Error("章节不存在");
      await validateLessonBindings(lesson.teachingContentId, lesson.questionPaperId);
      await prisma.courseLesson.create({ data: lesson });
    } else if (action === "lesson:update") {
      const lessonId = typeof body.lessonId === "string" ? body.lessonId.trim() : "";
      if (!lessonId) throw new Error("请选择要编辑的课时");
      const lesson = await prisma.courseLesson.findFirst({
        where: { id: lessonId, chapter: { courseId: id } },
        select: { id: true }
      });
      if (!lesson) return NextResponse.json({ error: "课时不存在或无权限" }, { status: 404 });
      const data = normalizeLessonUpdateInput(body);
      await validateLessonBindings(String(data.teachingContentId || ""), String(data.questionPaperId || ""));
      await prisma.courseLesson.update({ where: { id: lessonId }, data });
    } else {
      const data = normalizeCourseUpdateInput(body);
      if (auth.user.role !== "ADMIN" && !data.campusId) {
        throw new Error("校区角色只能维护本校课程");
      }
      if (data.campusId && !(await canAccessCampusId(auth.user, String(data.campusId), { activeOnly: true }))) {
        return NextResponse.json({ error: "无权限操作该校区课程" }, { status: 403 });
      }
      if (data.campusId) {
        const campus = await prisma.campus.findFirst({
          where: { AND: [{ id: String(data.campusId) }, await buildAccessibleCampusWhere(auth.user, { activeOnly: true })] },
          select: { id: true }
        });
        if (!campus) return NextResponse.json({ error: "校区不存在或无权限" }, { status: 404 });
      }
      await prisma.course.update({ where: { id }, data });
    }

    const item = await prisma.course.findUniqueOrThrow({ where: { id }, include: courseInclude });
    return NextResponse.json({ item: toCourseDto(item) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/courses");
  if ("response" in auth) return auth.response;
  if (!canManageCourse(auth.user.role)) return NextResponse.json({ error: "无权停用课程" }, { status: 403 });
  const { id } = await context.params;

  const exists = await prisma.course.findFirst({
    where: { AND: [{ id, deletedAt: null }, await buildCourseScopeWhere(auth.user)] },
    select: { id: true }
  });
  if (!exists) return NextResponse.json({ error: "课程不存在" }, { status: 404 });

  const item = await prisma.course.update({
    where: { id },
    data: { status: "DISABLED" },
    include: courseInclude
  });
  return NextResponse.json({ item: toCourseDto(item) });
}

async function validateLessonBindings(teachingContentId?: string | null, questionPaperId?: string | null) {
  if (teachingContentId) {
    const content = await prisma.teachingContent.findUnique({ where: { id: teachingContentId }, select: { id: true } });
    if (!content) throw new Error("教研内容不存在");
  }
  if (questionPaperId) {
    const paper = await prisma.examPaper.findUnique({ where: { id: questionPaperId }, select: { id: true } });
    if (!paper) throw new Error("试卷不存在");
  }
}
