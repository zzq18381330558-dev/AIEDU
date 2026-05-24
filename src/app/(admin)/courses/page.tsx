import Link from "next/link";
import { BookOpen } from "lucide-react";
import { CourseForm } from "@/components/courses/course-forms";
import { courseLabels } from "@/lib/courses";
import { buildAccessibleCampusWhere, buildCourseScopeWhere } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function CoursesPage() {
  const user = await requireUser("/courses");
  const [courses, campuses] = await Promise.all([
    prisma.course.findMany({
      where: { AND: [await buildCourseScopeWhere(user), { deletedAt: null }] },
      include: {
        campus: { select: { name: true } },
        _count: { select: { chapters: true, classes: true } }
      },
      orderBy: { updatedAt: "desc" },
      take: 100
    }),
    prisma.campus.findMany({ where: await buildAccessibleCampusWhere(user, { activeOnly: true }), select: { id: true, name: true }, orderBy: { name: "asc" } })
  ]);
  const canManage = user.role === "ADMIN" || user.role === "CAMPUS_MANAGER";

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink">课程中心</h1>
            <p className="mt-2 text-sm text-muted">以课程产品组织章节、课时、教研内容和题库试卷。</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFB] text-muted">
              <tr>
                <Th>课程</Th>
                <Th>归属</Th>
                <Th>方向</Th>
                <Th>状态</Th>
                <Th>章节</Th>
                <Th>班级</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {courses.map((course) => (
                <tr key={course.id}>
                  <Td>
                    <Link href={`/courses/${course.id}`} className="font-semibold text-brand-700">{course.name}</Link>
                    <div className="text-xs text-muted">{course.code} · {course.category}</div>
                  </Td>
                  <Td>{course.campus?.name || "总部课程"}</Td>
                  <Td>{courseLabels.examTrack[course.examTrack]}</Td>
                  <Td>{courseLabels.status[course.status]}{course.isPublished ? " / 已发布" : " / 未发布"}</Td>
                  <Td>{course._count.chapters}</Td>
                  <Td>{course._count.classes}</Td>
                </tr>
              ))}
              {courses.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted">暂无课程</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <CourseForm campuses={campuses} canManage={canManage} />
      </section>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-4 py-3 text-ink">{children}</td>;
}
