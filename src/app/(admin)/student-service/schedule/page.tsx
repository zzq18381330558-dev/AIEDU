import { ServiceTabs } from "@/components/student-service/service-tabs";
import { SessionCreateForm } from "@/components/student-service/simple-create-form";
import { classScopeWhere, studentServiceLabels } from "@/lib/student-service";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function SchedulePage() {
  const user = await requireUser("/student-service");
  const campusWhere =
    user.role === "ADMIN" || user.role === "HQ_OPERATIONS"
      ? { organizationId: user.organizationId }
      : user.campusId
        ? { id: user.campusId }
        : { id: "__none__" };

  const [sessions, campuses, classes, lecturers] = await Promise.all([
    prisma.courseSession.findMany({
      where: { class: classScopeWhere(user) },
      include: {
        campus: { select: { name: true } },
        class: { select: { id: true, name: true } },
        lecturer: { select: { name: true } },
        _count: { select: { attendanceRecords: true, reminders: true } }
      },
      orderBy: { startsAt: "asc" },
      take: 200
    }),
    prisma.campus.findMany({ where: campusWhere, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.studentClass.findMany({ where: classScopeWhere(user), select: { id: true, name: true }, orderBy: { startAt: "desc" } }),
    prisma.user.findMany({ where: { role: "LECTURER", status: "ACTIVE" }, select: { id: true, name: true } })
  ]);

  return (
    <div className="space-y-6">
      <Header title="课程表" description="维护班级课程、授课老师、教室/链接、作业内容，并为上课提醒和作业提醒提供数据。" />
      <ServiceTabs />
      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-line bg-white">
          <div className="divide-y divide-line">
            {sessions.map((item) => (
              <div key={item.id} className="grid gap-3 p-5 lg:grid-cols-[1fr_180px_160px_120px]">
                <div>
                  <div className="font-semibold text-ink">{item.title}</div>
                  <div className="mt-1 text-sm text-muted">{item.class.name} · {studentServiceLabels.sessionType[item.type]} · {item.room || "未填写地点"}</div>
                  {item.homework ? <div className="mt-2 text-xs text-muted">作业：{item.homework}</div> : null}
                </div>
                <div className="text-sm text-muted">{item.startsAt.toLocaleString("zh-CN")}</div>
                <div className="text-sm text-muted">授课：{item.lecturer?.name || "-"}</div>
                <div className="text-sm text-brand-700">打卡 {item._count.attendanceRecords}</div>
              </div>
            ))}
            {sessions.length === 0 ? <div className="p-12 text-center text-sm text-muted">暂无课程。先创建班级，再为班级添加课程安排。</div> : null}
          </div>
        </div>
        {user.role !== "ADMISSIONS_COUNSELOR" ? (
          <SessionCreateForm campuses={campuses} classes={classes} lecturers={lecturers} />
        ) : null}
      </section>
    </div>
  );
}

function Header({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </section>
  );
}
