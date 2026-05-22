import { ServiceTabs } from "@/components/student-service/service-tabs";
import { ClassCreateForm } from "@/components/student-service/simple-create-form";
import { classScopeWhere, studentServiceLabels } from "@/lib/student-service";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function ClassesPage() {
  const user = await requireUser("/student-service");
  const campusWhere =
    user.role === "ADMIN" || user.role === "HQ_OPERATIONS"
      ? { organizationId: user.organizationId }
      : user.campusId
        ? { id: user.campusId }
        : { id: "__none__" };

  const [classes, campuses, academicUsers, lecturers] = await Promise.all([
    prisma.studentClass.findMany({
      where: classScopeWhere(user),
      include: {
        campus: { select: { name: true } },
        academicOwner: { select: { name: true } },
        lecturer: { select: { name: true } },
        _count: { select: { students: true, sessions: true } }
      },
      orderBy: { startAt: "desc" }
    }),
    prisma.campus.findMany({ where: campusWhere, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: "ACADEMIC_TEACHER", status: "ACTIVE" }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { role: "LECTURER", status: "ACTIVE" }, select: { id: true, name: true } })
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
                <Th>校区</Th>
                <Th>开课时间</Th>
                <Th>班主任/教务</Th>
                <Th>授课老师</Th>
                <Th>方向</Th>
                <Th>学员人数</Th>
                <Th>课程数</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {classes.map((item) => (
                <tr key={item.id}>
                  <Td className="font-semibold">{item.name}</Td>
                  <Td>{item.campus.name}</Td>
                  <Td>{item.startAt.toLocaleString("zh-CN")}</Td>
                  <Td>{item.academicOwner?.name || "-"}</Td>
                  <Td>{item.lecturer?.name || "-"}</Td>
                  <Td>{studentServiceLabels.examTrack[item.examTrack]}</Td>
                  <Td>{item._count.students}</Td>
                  <Td>{item._count.sessions}</Td>
                </tr>
              ))}
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted">暂无班级。新建班级后可关联学员并排课。</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {user.role !== "ADMISSIONS_COUNSELOR" ? (
          <ClassCreateForm campuses={campuses} academicUsers={academicUsers} lecturers={lecturers} />
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
