import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api";
import { studentScopeWhere } from "@/lib/student-service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;

  const items = await prisma.attendanceRecord.findMany({
    where: {
      student: studentScopeWhere(auth.user),
      status: "ABSENT"
    },
    include: {
      student: { select: { id: true, name: true, phone: true, school: true, academicOwner: { select: { name: true } } } },
      courseSession: { select: { title: true, startsAt: true, class: { select: { name: true } } } }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return NextResponse.json({ items });
}
