import { ServiceTabs } from "@/components/student-service/service-tabs";
import { AttendanceCreateForm } from "@/components/student-service/simple-create-form";
import { studentScopeWhere, classScopeWhere, studentServiceLabels } from "@/lib/student-service";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function CheckInsPage() {
  const user = await requireUser("/student-service");
  const [records, students, sessions] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: { student: studentScopeWhere(user) },
      include: {
        student: { select: { id: true, name: true, school: true } },
        courseSession: { select: { id: true, title: true, startsAt: true, class: { select: { name: true } } } },
        recorder: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 200
    }),
    prisma.student.findMany({ where: studentScopeWhere(user), select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.courseSession.findMany({
      where: { class: classScopeWhere(user) },
      select: { id: true, title: true },
      orderBy: { startsAt: "desc" },
      take: 100
    })
  ]);

  return (
    <div className="space-y-6">
      <Header title="学员中心 · 打卡记录" description="记录学员到课、迟到、请假和缺课，为缺课提醒与学习进度分析提供依据。" />
      <ServiceTabs />
      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-line bg-white">
          <div className="divide-y divide-line">
            {records.map((item) => (
              <div key={item.id} className="grid gap-3 p-5 md:grid-cols-[1fr_160px_180px_120px]">
                <div>
                  <div className="font-semibold text-ink">{item.student.name}</div>
                  <div className="mt-1 text-sm text-muted">{item.courseSession.class.name} · {item.courseSession.title}</div>
                  {item.note ? <div className="mt-2 text-xs text-muted">{item.note}</div> : null}
                </div>
                <div><AttendanceBadge status={item.status} /></div>
                <div className="text-sm text-muted">{item.checkInAt ? item.checkInAt.toLocaleString("zh-CN") : "-"}</div>
                <div className="text-sm text-muted">{item.recorder?.name || "-"}</div>
              </div>
            ))}
            {records.length === 0 ? <div className="p-12 text-center text-sm text-muted">暂无打卡记录。新建课程并登记学员到课、迟到、请假或缺课后会显示在这里。</div> : null}
          </div>
        </div>
        {user.role !== "ADMISSIONS_COUNSELOR" ? (
          <AttendanceCreateForm students={students} sessions={sessions.map((item) => ({ id: item.id, name: item.title }))} />
        ) : null}
      </section>
    </div>
  );
}

function AttendanceBadge({ status }: { status: keyof typeof studentServiceLabels.attendanceStatus }) {
  const styles = {
    PRESENT: "bg-brand-50 text-brand-700",
    LATE: "bg-amber-50 text-amber-700",
    LEAVE: "bg-sky-50 text-sky-700",
    ABSENT: "bg-red-50 text-red-700"
  };
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs ${styles[status]}`}>
      {studentServiceLabels.attendanceStatus[status]}
    </span>
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
