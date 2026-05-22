import { Bell } from "lucide-react";
import { ServiceTabs } from "@/components/student-service/service-tabs";
import { classScopeWhere, studentScopeWhere } from "@/lib/student-service";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function AbsencesPage() {
  const user = await requireUser("/student-service");
  const now = new Date();
  const [recordedAbsences, overdueSessions] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: {
        student: studentScopeWhere(user),
        status: "ABSENT"
      },
      include: {
        student: { select: { name: true, phone: true, school: true, academicOwner: { select: { name: true } } } },
        courseSession: { select: { title: true, startsAt: true, class: { select: { name: true } } } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    }),
    prisma.courseSession.findMany({
      where: { startsAt: { lt: now }, class: classScopeWhere(user) },
      include: {
        class: {
          select: {
            name: true,
            students: {
              where: studentScopeWhere(user),
              select: { id: true, name: true, phone: true, school: true, enrolledAt: true, academicOwner: { select: { name: true } } }
            }
          }
        },
        attendanceRecords: { select: { studentId: true } }
      },
      orderBy: { startsAt: "desc" },
      take: 80
    })
  ]);

  const recordedKeys = new Set(recordedAbsences.map((item) => `${item.studentId}:${item.courseSessionId}`));
  const inferredAbsences = overdueSessions.flatMap((session) => {
    const checkedStudentIds = new Set(session.attendanceRecords.map((item) => item.studentId));
    return session.class.students
      .filter((student) => student.enrolledAt <= session.startsAt)
      .filter((student) => !checkedStudentIds.has(student.id))
      .filter((student) => !recordedKeys.has(`${student.id}:${session.id}`))
      .map((student) => ({
        id: `inferred-${session.id}-${student.id}`,
        inferred: true,
        student,
        courseSession: {
          title: session.title,
          startsAt: session.startsAt,
          class: { name: session.class.name }
        }
      }));
  });
  const absences = [
    ...recordedAbsences.map((item) => ({ ...item, inferred: false })),
    ...inferredAbsences
  ].sort((a, b) => b.courseSession.startsAt.getTime() - a.courseSession.startsAt.getTime());

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink">缺课提醒</h1>
            <p className="mt-1 text-sm text-muted">汇总缺课记录，后续可通过企业微信/OpenClaw 自动推送关怀话术。</p>
          </div>
        </div>
      </section>
      <ServiceTabs />
      <div className="rounded-lg border border-line bg-white">
        <div className="divide-y divide-line">
          {absences.map((item) => (
            <div key={item.id} className="grid gap-3 p-5 md:grid-cols-[1fr_180px_160px_160px]">
              <div>
                <div className="font-semibold text-ink">{item.student.name}</div>
                <div className="mt-1 text-sm text-muted">{item.student.phone} · {item.student.school || "未填写学校"}</div>
              </div>
              <div className="text-sm text-muted">{item.courseSession.class.name}</div>
              <div className="text-sm text-muted">
                {item.courseSession.startsAt.toLocaleString("zh-CN")}
                {item.inferred ? <div className="mt-1 text-xs text-red-700">未打卡自动识别</div> : null}
              </div>
              <div className="text-sm text-brand-700">教务：{item.student.academicOwner?.name || "未分配"}</div>
            </div>
          ))}
          {absences.length === 0 ? <div className="p-12 text-center text-sm text-muted">暂无缺课提醒。已开课课程的缺课记录和未打卡学员会自动汇总到这里。</div> : null}
        </div>
      </div>
    </div>
  );
}
