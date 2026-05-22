import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api";
import { buildWeaknessRows } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;

  const records = await prisma.wrongQuestionRecord.findMany({
    include: {
      question: {
        select: {
          subject: true,
          chapter: true,
          knowledgePoint: true,
          difficulty: true
        }
      }
    },
    take: 1000
  });

  return NextResponse.json({ rows: buildWeaknessRows(records) });
}
