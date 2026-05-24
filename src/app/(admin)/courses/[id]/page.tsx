import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { ChapterCreateForm, ChapterEditForm, CourseForm, LessonCreateForm, LessonEditForm } from "@/components/courses/course-forms";
import { courseLabels } from "@/lib/courses";
import { buildAccessibleCampusWhere, buildCourseScopeWhere } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("/courses");
  const { id } = await params;
  const [course, campuses, contents, papers] = await Promise.all([
    prisma.course.findFirst({
      where: { AND: [{ id, deletedAt: null }, await buildCourseScopeWhere(user)] },
      include: {
        campus: { select: { id: true, name: true } },
        createdBy: { select: { name: true, phone: true } },
        chapters: {
          include: {
            lessons: {
              include: {
                teachingContent: { select: { id: true, title: true } },
                questionPaper: { select: { id: true, title: true } }
              },
              orderBy: { sortOrder: "asc" }
            }
          },
          orderBy: { sortOrder: "asc" }
        },
        _count: { select: { classes: true } }
      }
    }),
    prisma.campus.findMany({ where: await buildAccessibleCampusWhere(user, { activeOnly: true }), select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.teachingContent.findMany({ select: { id: true, title: true }, orderBy: { updatedAt: "desc" }, take: 100 }),
    prisma.examPaper.findMany({ select: { id: true, title: true }, orderBy: { updatedAt: "desc" }, take: 100 })
  ]);

  if (!course) notFound();
  const canManage = user.role === "ADMIN" || user.role === "CAMPUS_MANAGER";
  const chapterOptions = course.chapters.map((chapter) => ({ id: chapter.id, name: `${chapter.sortOrder}. ${chapter.title}` }));
  const contentOptions = contents.map((item) => ({ id: item.id, name: item.title }));
  const paperOptions = papers.map((item) => ({ id: item.id, name: item.title }));

  return (
    <div className="space-y-6">
      <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" />
        返回课程中心
      </Link>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink">{course.name}</h1>
            <p className="mt-2 text-sm text-muted">{course.code} · {course.category} · {course.campus?.name || "总部课程"}</p>
            <div className="mt-2 text-sm text-muted">
              {courseLabels.examTrack[course.examTrack]} / {courseLabels.status[course.status]} / {course.isPublished ? "已发布" : "未发布"} / 关联班级 {course._count.classes}
            </div>
          </div>
        </div>
        {course.description ? <p className="mt-4 text-sm leading-6 text-muted">{course.description}</p> : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-lg border border-line bg-white">
            <div className="border-b border-line px-5 py-4 font-semibold text-ink">章节与课时</div>
            <div className="divide-y divide-line">
              {course.chapters.map((chapter) => (
                <div key={chapter.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-ink">{chapter.sortOrder}. {chapter.title}</div>
                      {chapter.description ? <div className="mt-1 text-sm text-muted">{chapter.description}</div> : null}
                    </div>
                    <ChapterEditForm courseId={course.id} chapter={chapter} canManage={canManage} />
                  </div>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-muted">
                        <tr>
                          <Th>课时</Th>
                          <Th>时长</Th>
                          <Th>教研内容</Th>
                          <Th>试卷</Th>
                          {canManage ? <Th>操作</Th> : null}
                        </tr>
                      </thead>
                      <tbody>
                        {chapter.lessons.map((lesson) => (
                          <tr key={lesson.id}>
                            <Td>{lesson.sortOrder}. {lesson.title}</Td>
                            <Td>{lesson.durationMinutes} 分钟</Td>
                            <Td>{lesson.teachingContent?.title || "-"}</Td>
                            <Td>{lesson.questionPaper?.title || "-"}</Td>
                            {canManage ? (
                              <Td>
                                <LessonEditForm
                                  courseId={course.id}
                                  lesson={lesson}
                                  contents={contentOptions}
                                  papers={paperOptions}
                                  canManage={canManage}
                                />
                              </Td>
                            ) : null}
                          </tr>
                        ))}
                        {chapter.lessons.length === 0 ? <tr><td colSpan={canManage ? 5 : 4} className="py-4 text-muted">暂无课时</td></tr> : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {course.chapters.length === 0 ? <div className="p-8 text-center text-sm text-muted">暂无章节</div> : null}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <CourseForm value={course} campuses={campuses} canManage={canManage} />
          <ChapterCreateForm courseId={course.id} canManage={canManage} />
          <LessonCreateForm
            courseId={course.id}
            chapters={chapterOptions}
            contents={contentOptions}
            papers={paperOptions}
            canManage={canManage && chapterOptions.length > 0}
          />
        </div>
      </section>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-2 font-medium">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-3 py-2 text-ink">{children}</td>;
}
