import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BrainCircuit, CalendarCheck, ClipboardList, MessageSquareText } from "lucide-react";
import { AiStudentActions } from "@/components/student-service/ai-actions";
import {
  ServiceRecordForm,
  StudentAttendanceForm,
  StudentStatusForm
} from "@/components/student-service/student-detail-actions";
import { crmLabels } from "@/lib/crm";
import { studentServiceLabels } from "@/lib/student-service";
import { buildCourseSessionScopeWhere, buildStudentScopeWhere } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getUserDisplayName } from "@/lib/user-display";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("/student-service");
  const { id } = await params;
  const student = await prisma.student.findFirst({
    where: { AND: [{ id }, await buildStudentScopeWhere(user)] },
    include: {
      campus: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
      academicOwner: { select: { id: true, name: true, email: true, phone: true } },
      salesOwner: { select: { id: true, name: true, email: true, phone: true } },
      lead: { select: { id: true, sourceChannel: true, status: true, intentLevel: true, note: true, createdAt: true } },
      tickets: { include: { owner: { select: { name: true, email: true, phone: true } } }, orderBy: { createdAt: "desc" } },
      studyPlans: { orderBy: { createdAt: "desc" } },
      reminders: { orderBy: { scheduledAt: "desc" }, take: 20 },
      attendanceRecords: {
        include: { courseSession: { select: { id: true, title: true, startsAt: true, homework: true } }, recorder: { select: { name: true, email: true, phone: true } } },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!student) notFound();

  const sessions = await prisma.courseSession.findMany({
    where: {
      AND: [await buildCourseSessionScopeWhere(user), { classId: student.classId || "__none__" }]
    },
    select: { id: true, title: true, startsAt: true },
    orderBy: { startsAt: "desc" },
    take: 50
  });
  const canManage = user.role !== "ADMISSIONS_COUNSELOR";
  const absences = student.attendanceRecords.filter((item) => item.status === "ABSENT");
  const timeline = [
    ...student.tickets.map((item) => ({
      id: `ticket-${item.id}`,
      at: item.createdAt,
      type: "服务记录",
      title: item.title,
      detail: item.aiSuggestion || "",
      meta: `${studentServiceLabels.serviceTicketStatus[item.status]} / ${getUserDisplayName(item.owner, "系统")}`
    })),
    ...student.attendanceRecords.map((item) => ({
      id: `attendance-${item.id}`,
      at: item.createdAt,
      type: "打卡记录",
      title: item.courseSession.title,
      detail: item.note || item.courseSession.homework || "",
      meta: `${studentServiceLabels.attendanceStatus[item.status]} / ${getUserDisplayName(item.recorder, "系统")}`
    })),
    ...student.studyPlans.map((item) => ({
      id: `plan-${item.id}`,
      at: item.createdAt,
      type: item.planText ? "AI 学习计划" : "AI 服务话术",
      title: item.title,
      detail: item.planText || item.serviceScript || item.aiSummary || "",
      meta: `进度 ${item.progress}%`
    })),
    ...student.reminders.map((item) => ({
      id: `reminder-${item.id}`,
      at: item.scheduledAt,
      type: "提醒",
      title: item.title,
      detail: item.content,
      meta: `${studentServiceLabels.reminderType[item.type]} / ${item.status}`
    }))
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <div className="space-y-6">
      <Link href="/student-service" className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" />
        返回学员中心
      </Link>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-ink">{student.name}</h1>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <Badge>{studentServiceLabels.studyStatus[student.studyStatus]}</Badge>
                  <Badge>{studentServiceLabels.examTrack[student.examTrack]}</Badge>
                  {student.lead ? <Badge>CRM 成交转入</Badge> : null}
                </div>
              </div>
            </div>
            {student.serviceNote ? <p className="mt-4 rounded-md bg-[#F8FAFB] p-3 text-sm leading-6 text-muted">{student.serviceNote}</p> : null}
          </div>
          <div className="grid gap-2 text-sm text-muted sm:grid-cols-2 lg:text-right">
            <div>手机：{student.phone}</div>
            <div>校区：{student.campus.name}</div>
            <div>学校：{student.school || "-"}</div>
            <div>专业：{student.grade || ""} {student.major || ""}</div>
            <div>班型：{student.classType || "-"}</div>
            <div>班级：{student.class?.name || "未分班"}</div>
            <div>教务：{getUserDisplayName(student.academicOwner, "未分配")}</div>
            <div>招生：{getUserDisplayName(student.salesOwner, "未分配")}</div>
          </div>
        </div>
      </section>

      {student.lead ? (
        <section className="rounded-lg border border-line bg-white p-5">
          <div className="font-semibold text-ink">招生来源信息</div>
          <div className="mt-3 grid gap-2 text-sm text-muted md:grid-cols-4">
            <div>来源：{crmLabels.sourceChannel[student.lead.sourceChannel]}</div>
            <div>成交状态：{crmLabels.status[student.lead.status]}</div>
            <div>意向：{crmLabels.intentLevel[student.lead.intentLevel]}</div>
            <div>线索建档：{student.lead.createdAt.toLocaleDateString("zh-CN")}</div>
          </div>
          {student.lead.note ? <p className="mt-3 text-sm leading-6 text-muted">线索备注：{student.lead.note}</p> : null}
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Panel title="服务记录时间轴" icon={MessageSquareText}>
            <div className="divide-y divide-line">
              {timeline.map((item) => (
                <div key={item.id} className="p-5">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-ink">{item.title}</span>
                    <span className="rounded-md bg-brand-50 px-2 py-1 text-xs text-brand-700">{item.type}</span>
                    <span className="text-xs text-muted">{item.at.toLocaleString("zh-CN")}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted">{item.meta}</div>
                  {item.detail ? <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{item.detail}</pre> : null}
                </div>
              ))}
              {timeline.length === 0 ? <Empty>暂无服务记录</Empty> : null}
            </div>
          </Panel>

          <Panel title="打卡记录" icon={CalendarCheck}>
            <div className="divide-y divide-line">
              {student.attendanceRecords.map((item) => (
                <div key={item.id} className="grid gap-2 p-4 md:grid-cols-[1fr_120px_160px]">
                  <div>
                    <div className="font-semibold text-ink">{item.courseSession.title}</div>
                    <div className="mt-1 text-xs text-muted">{item.courseSession.startsAt.toLocaleString("zh-CN")}</div>
                  </div>
                  <div><AttendanceBadge status={item.status} /></div>
                  <div className="text-sm text-muted">{item.checkInAt ? item.checkInAt.toLocaleString("zh-CN") : "-"}</div>
                </div>
              ))}
              {student.attendanceRecords.length === 0 ? <Empty>暂无打卡记录</Empty> : null}
            </div>
          </Panel>

          <Panel title="缺课记录" icon={ClipboardList}>
            <div className="divide-y divide-line">
              {absences.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="font-semibold text-ink">{item.courseSession.title}</div>
                  <div className="mt-1 text-sm text-muted">{item.note || "未填写缺课原因"}</div>
                </div>
              ))}
              {absences.length === 0 ? <Empty>暂无缺课记录</Empty> : null}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <StudentStatusForm studentId={student.id} defaultStatus={student.studyStatus} defaultNote={student.serviceNote} canManage={canManage} />
          <AiStudentActions studentId={student.id} />
          <ServiceRecordForm studentId={student.id} canManage={canManage} />
          <StudentAttendanceForm studentId={student.id} sessions={sessions.map((item) => ({ id: item.id, name: `${item.title} · ${item.startsAt.toLocaleDateString("zh-CN")}` }))} canManage={canManage} />
        </div>
      </section>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md bg-brand-50 px-2 py-1 text-brand-700">{children}</span>;
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof BrainCircuit; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="flex items-center gap-2 border-b border-line px-5 py-4 font-semibold text-ink">
        <Icon className="h-4 w-4 text-brand-600" />
        {title}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="p-8 text-center text-sm text-muted">{children}</div>;
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
