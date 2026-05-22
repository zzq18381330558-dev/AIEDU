import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { leadScopeWhere } from "@/lib/crm";
import { prisma } from "@/lib/prisma";

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/crm");
  if ("response" in auth) return auth.response;
  const { id } = await context.params;

  try {
    const lead = await prisma.lead.findFirst({
      where: { id, ...leadScopeWhere(auth.user) },
      include: {
        student: { select: { id: true } }
      }
    });
    if (!lead) return NextResponse.json({ error: "线索不存在" }, { status: 404 });
    if (lead.student) return NextResponse.json({ error: "该线索已转为学员" }, { status: 409 });

    const item = await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          leadId: lead.id,
          campusId: lead.campusId,
          salesOwnerId: lead.assigneeId || (auth.user.role === "ADMISSIONS_COUNSELOR" ? auth.user.id : null),
          name: lead.name,
          phone: lead.phone,
          school: lead.school,
          grade: lead.grade,
          major: lead.major,
          examTrack: lead.examTrack,
          studyStatus: "NOT_STARTED",
          serviceNote: lead.note || "由招生中心成交线索转入。"
        },
        include: {
          campus: { select: { id: true, name: true } },
          salesOwner: { select: { id: true, name: true } }
        }
      });
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: "WON",
          lastFollowedAt: new Date()
        }
      });
      await tx.leadFollowUp.create({
        data: {
          leadId: lead.id,
          creatorId: auth.user.id,
          content: "线索已成交，并转入学员服务系统。",
          status: "WON",
          intentLevel: lead.intentLevel,
          followAt: new Date()
        }
      });
      return student;
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
