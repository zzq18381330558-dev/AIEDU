import { ServiceTabs } from "@/components/student-service/service-tabs";
import { ClassCreateForm, ClassEditForm } from "@/components/student-service/simple-create-form";
import { studentServiceLabels } from "@/lib/student-service";
import { buildAccessibleCampusWhere, buildClassScopeWhere, buildCourseScopeWhere, buildScopedUserWhere } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getUserDisplayName } from "@/lib/user-display";

export default async function ClassesPage() {
  const user = await requireUser("/student-service");
  const campusWhere = await buildAccessibleCampusWhere(user, { activeOnly: true });

  const [classes, campuses, courses, academicUsers, lecturers] = await Promise.all([
    prisma.studentClass.findMany({
      where: await buildClassScopeWhere(user),
      include: {
        campus: { select: { name: true } },
        course: { select: { name: true, code: true } },
        academicOwner: { select: { id: true, name: true, phone: true } },
        lecturer: { select: { id: true, name: true, phone: true } },
        _count: { select: { students: true, sessions: true } }
      },
      orderBy: { startAt: "desc" }
    }),
    prisma.campus.findMany({ where: campusWhere, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.course.findMany({
      where: {
        AND: [
          user.role === "ADMIN" ? { organizationId: user.organizationId } : { OR: [await buildCourseScopeWhere(user), { campusId: null, organizationId: user.organizationId }] },
          { status: "ACTIVE", deletedAt: null }
        ]
      },
      select: { id: true, name: true, code: true, campusId: true },
      orderBy: { name: "asc" }
    }),
    prisma.user.findMany({ where: await buildScopedUserWhere(user, "ACADEMIC_TEACHER"), select: { id: true, name: true, phone: true } }),
    prisma.user.findMany({ where: await buildScopedUserWhere(user, "LECTURER"), select: { id: true, name: true, phone: true } })
  ]);

  return (
    <div className="space-y-6">
      <Shell title="学员中心 · 班级管理" description="管理班级名称、校区、开课时间、班主任/教务、授课老师和学员人数。" />
      <ServiceTabs />
      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFB] text-muted">
              <tr>
                <Th>班级名称</Th>
                <Th>课程</Th>
                <Th>校区</Th>
                <Th>开课时间</Th>
                <Th>班主任/教务</Th>
                <Th>授课老师</Th>
                <Th>方向</Th>
                <Th>学员人数</Th>
                <Th>课程数</Th>
                {user.role !== "ADMISSIONS_COUNSELOR" ? <Th>操作</Th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {classes.map((item) => (
                <tr key={item.id}>
                  <Td className="font-semibold">{item.name}</Td>
                  <Td>{item.course.name}</Td>
                  <Td>{item.campus.name}</Td>
                  <Td>{item.startAt.toLocaleString("zh-CN")}</Td>
                  <Td>{getUserDisplayName(item.academicOwner)}</Td>
                  <Td>{getUserDisplayName(item.lecturer)}</Td>
                  <Td>{studentServiceLabels.examTrack[item.examTrack]}</Td>
                  <Td>{item._count.students}</Td>
                  <Td>{item._count.sessions}</Td>
                  {user.role !== "ADMISSIONS_COUNSELOR" ? (
                    <Td>
                      <ClassEditForm
                        value={item}
                        campuses={campuses}
                        courses={courses.map((course) => ({ id: course.id, name: `${course.name}（${course.code}）`, campusId: course.campusId }))}
                        academicUsers={academicUsers}
                        lecturers={lecturers}
                      />
                    </Td>
                  ) : null}
                </tr>
              ))}
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={user.role !== "ADMISSIONS_COUNSELOR" ? 10 : 9} className="px-4 py-12 text-center text-muted">暂无班级。新建班级后可关联学员并排课。</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {user.role !== "ADMISSIONS_COUNSELOR" ? (
          <ClassCreateForm campuses={campuses} courses={courses.map((item) => ({ id: item.id, name: `${item.name}（${item.code}）`, campusId: item.campusId }))} academicUsers={academicUsers} lecturers={lecturers} />
        ) : null}
      </section>
    </div>
  );
}

function Shell({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-4 py-3 text-ink ${className}`}>{children}</td>;
}
