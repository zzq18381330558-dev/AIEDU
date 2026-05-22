import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import { canManageSop, normalizeSopTemplateInput, parseStepLines } from "@/lib/sop";
import { prisma } from "@/lib/prisma";

const include = {
  steps: { orderBy: { sortOrder: "asc" } },
  _count: { select: { executions: true, tasks: true, inspections: true, weeklyReports: true } }
} satisfies Prisma.SopTemplateInclude;

export async function GET(request: NextRequest) {
  const auth = await requireApiUser("/sop");
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const where: Prisma.SopTemplateWhereInput = {};
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim();
  if (category) where.category = category as Prisma.EnumSopCategoryFilter["equals"];
  if (status) where.status = status as Prisma.EnumSopStatusFilter["equals"];
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { module: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } }
    ];
  }

  const items = await prisma.sopTemplate.findMany({
    where,
    include,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 100
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/sop");
  if ("response" in auth) return auth.response;
  if (!canManageSop(auth.user.role)) return NextResponse.json({ error: "无权新建 SOP" }, { status: 403 });

  try {
    const body = await request.json();
    const input = normalizeSopTemplateInput(body);
    const steps = parseStepLines(body.steps);
    const item = await prisma.sopTemplate.create({
      data: {
        ...input,
        steps: steps.length
          ? {
              create: steps.map((step) => ({
                title: step.title,
                standard: step.standard,
                sortOrder: step.sortOrder
              }))
            }
          : undefined
      },
      include
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
