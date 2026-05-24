import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import { canManageCourse, courseInclude, normalizeCourseInput, toCourseDto } from "@/lib/courses";
import { buildAccessibleCampusWhere, buildCourseScopeWhere, canAccessCampusId } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser("/courses");
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const scope = await buildCourseScopeWhere(auth.user);
  const filters: Prisma.CourseWhereInput = { deletedAt: null };
  const search = searchParams.get("search")?.trim();
  if (search) {
    filters.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } }
    ];
  }
  const campusId = searchParams.get("campusId");
  if (campusId) filters.campusId = campusId === "__hq__" ? null : campusId;

  const items = await prisma.course.findMany({
    where: { AND: [scope, filters] },
    include: courseInclude,
    orderBy: { updatedAt: "desc" },
    take: 100
  });

  return NextResponse.json({ items: items.map(toCourseDto) });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/courses");
  if ("response" in auth) return auth.response;
  if (!canManageCourse(auth.user.role)) return NextResponse.json({ error: "无权新建课程" }, { status: 403 });

  try {
    const body = await request.json();
    const data = normalizeCourseInput(body, { organizationId: auth.user.organizationId, createdById: auth.user.id });
    if (auth.user.role !== "ADMIN" && !data.campusId) {
      throw new Error("校区角色只能创建本校课程");
    }
    if (data.campusId && !(await canAccessCampusId(auth.user, data.campusId, { activeOnly: true }))) {
      return NextResponse.json({ error: "无权限操作该校区课程" }, { status: 403 });
    }
    if (data.campusId) {
      const campus = await prisma.campus.findFirst({
        where: { AND: [{ id: data.campusId }, await buildAccessibleCampusWhere(auth.user, { activeOnly: true })] },
        select: { id: true }
      });
      if (!campus) return NextResponse.json({ error: "校区不存在或无权限" }, { status: 404 });
    }

    const item = await prisma.course.create({
      data,
      include: courseInclude
    });
    return NextResponse.json({ item: toCourseDto(item) }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
