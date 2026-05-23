import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import { AiStudentActions } from "@/components/student-service/ai-actions";
import { ServiceTabs } from "@/components/student-service/service-tabs";
import { StudentCreateForm } from "@/components/student-service/simple-create-form";
import { studentServiceLabels, studentScopeWhere, classScopeWhere } from "@/lib/student-service";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getUserDisplayName } from "@/lib/user-display";

export default async function StudentServicePage() {
  const user = await requireUser("/student-service");
  const scope = studentScopeWhere(user);
  const campusWhere =
    user.role === "ADMIN" || user.role === "HQ_OPERATIONS"
      ? { organizationId: user.organizationId }
      : user.campusId
        ? { id: user.campusId }
        : { id: "__none__" };

  const [students, campuses, classes, academicUsers, salesUsers, planCount, pendingReminders] = await Promise.all([
    prisma.student.findMany({
      where: scope,
      include: {
        campus: { select: { name: true } },
        class: { select: { name: true } },
        academicOwner: { select: { name: true, email: true, phone: true } },
        salesOwner: { select: { name: true, email: true, phone: true } },
        _count: { select: { studyPlans: true, attendanceRecords: true } }
      },
      orderBy: { updatedAt: "desc" },
      take: 100
    }),
    prisma.campus.findMany({ where: campusWhere, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.studentClass.findMany({ where: classScopeWhere(user), select: { id: true, name: true }, orderBy: { startAt: "desc" } }),
    prisma.user.findMany({
      where: { role: "ACADEMIC_TEACHER", status: "ACTIVE", ...(user.campusId ? { campusId: user.campusId } : {}) },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { name: "asc" }
    }),
    prisma.user.findMany({
      where: { role: "ADMISSIONS_COUNSELOR", status: "ACTIVE", ...(user.campusId ? { campusId: user.campusId } : {}) },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { name: "asc" }
    }),
    prisma.studyPlan.count({ where: { student: scope } }),
    prisma.studentReminder.count({ where: { student: scope, status: "PENDING" } })
  ]);

  const canManage = user.role !== "ADMISSIONS_COUNSELOR";

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white shadow-soft">
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-ink">学员中心</h1>
              <p className="mt-2 text-sm text-muted">统一管理学员档案、服务提醒、课程打卡、缺课预警和学习计划。</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <Metric label="学员" value={String(students.length)} />
            <Metric label="AI 计划" value={String(planCount)} />
            <Metric label="待推送" value={String(pendingReminders)} />
          </div>
        </div>
        <ServiceTabs />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="border-b border-line px-5 py-4 font-semibold text-ink">学员档案</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-[#F8FAFB] text-muted">
                <tr>
                  <Th>姓名</Th>
                  <Th>学校/专业</Th>
                  <Th>报名班型</Th>
                  <Th>教资方向</Th>
                  <Th>所属班级</Th>
                  <Th>所属教务</Th>
                  <Th>学习状态</Th>
                  <Th>服务备注</Th>
                  <Th>AI 服务</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {students.map((student) => (
                  <tr key={student.id} className="align-top hover:bg-[#FAFBFC]">
                    <Td>
                      <Link href={`/student-service/${student.id}`} className="font-semibold text-brand-700">{student.name}</Link>
                      <div className="text-xs text-muted">{student.phone}</div>
                    </Td>
                    <Td>
                      {student.school || "-"}
                      <div className="text-xs text-muted">{student.grade || ""} {student.major || ""}</div>
                    </Td>
                    <Td>{student.classType || "-"}</Td>
                    <Td>{studentServiceLabels.examTrack[student.examTrack]}</Td>
                    <Td>{student.class?.name || "未分班"}</Td>
                    <Td>{getUserDisplayName(student.academicOwner, "未分配")}</Td>
                    <Td>{studentServiceLabels.studyStatus[student.studyStatus]}</Td>
                    <Td className="max-w-xs whitespace-normal">{student.serviceNote || "-"}</Td>
                    <Td><AiStudentActions studentId={student.id} /></Td>
                  </tr>
                ))}
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-muted">暂无学员。可从成交线索转入，或由教务在右侧新建学员档案。</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
        {canManage ? (
          <StudentCreateForm campuses={campuses} classes={classes} academicUsers={academicUsers} salesUsers={salesUsers} />
        ) : (
          <section className="rounded-lg border border-line bg-white p-4 text-sm leading-6 text-muted">
            招生老师只能查看自己成交归属的学员，学员资料由教务老师维护。
          </section>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line px-4 py-2">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-lg font-semibold text-ink">{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-4 py-3 text-ink ${className}`}>{children}</td>;
}
