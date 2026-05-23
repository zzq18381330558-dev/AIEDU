import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import {
  normalizeStudentImportRow,
  normalizeStudentInput,
  studentImportRequiredHeaders
} from "@/lib/student-service";
import { buildAccessibleCampusWhere, buildClassScopeWhere, buildScopedUserWhere } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

const importEnumValues = {
  教资方向: new Set(["幼儿", "小学", "中学", "INFANT", "PRIMARY", "MIDDLE"]),
  学习状态: new Set(["未开学", "学习中", "低活跃", "冲刺期", "面试阶段", "暂停", "已结课", "已退费", "NOT_STARTED", "STUDYING", "LOW_ACTIVE", "SPRINT", "INTERVIEW_STAGE", "PAUSED", "COMPLETED", "REFUNDED"])
} satisfies Record<string, Set<string>>;

async function rowsFromFile(file: File) {
  const name = file.name.toLowerCase();
  if (!name.endsWith(".xlsx")) throw new Error("请上传 .xlsx 格式的 Excel 文件");

  const xlsx = await import("xlsx");
  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
}

function valueText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function matchByNameOrId<T extends { id: string; name: string }>(items: T[], value: unknown) {
  const normalized = valueText(value);
  if (!normalized) return null;
  return items.find((item) => item.id === normalized || item.name === normalized) || null;
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;
  if (auth.user.role === "ADMISSIONS_COUNSELOR") {
    return NextResponse.json({ error: "招生老师无权导入学员" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("请上传 .xlsx 格式的 Excel 文件");

    const campusWhere = await buildAccessibleCampusWhere(auth.user, { activeOnly: true });
    const [rows, campuses, classes, academicUsers, salesUsers] = await Promise.all([
      rowsFromFile(file),
      prisma.campus.findMany({ where: campusWhere, select: { id: true, name: true } }),
      prisma.studentClass.findMany({ where: await buildClassScopeWhere(auth.user), select: { id: true, name: true, campusId: true } }),
      prisma.user.findMany({ where: await buildScopedUserWhere(auth.user, "ACADEMIC_TEACHER"), select: { id: true, name: true, campusId: true } }),
      prisma.user.findMany({ where: await buildScopedUserWhere(auth.user, "ADMISSIONS_COUNSELOR"), select: { id: true, name: true, campusId: true } })
    ]);
    assertRequiredHeaders(rows, [...studentImportRequiredHeaders]);

    let success = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (const [index, row] of rows.entries()) {
      try {
        assertImportEnums(row);
        const input = normalizeStudentImportRow(row);
        const campus = matchByNameOrId(campuses, input.campusName);
        if (!campus) throw new Error("校区不存在，请填写系统内已有校区");

        const studentClass = valueText(input.className) ? matchByNameOrId(classes, input.className) : null;
        if (valueText(input.className) && !studentClass) throw new Error("班级不存在，请填写系统内已有班级");
        if (studentClass && studentClass.campusId !== campus.id) throw new Error("班级不属于所填校区");

        const academicOwner = valueText(input.academicOwnerName) ? matchByNameOrId(academicUsers, input.academicOwnerName) : null;
        if (valueText(input.academicOwnerName) && !academicOwner) throw new Error("教务老师不存在，请填写系统内已有教务老师");
        if (academicOwner?.campusId && academicOwner.campusId !== campus.id) throw new Error("教务老师不属于所填校区");

        const salesOwner = valueText(input.salesOwnerName) ? matchByNameOrId(salesUsers, input.salesOwnerName) : null;
        if (valueText(input.salesOwnerName) && !salesOwner) throw new Error("招生老师不存在，请填写系统内已有招生老师");
        if (salesOwner?.campusId && salesOwner.campusId !== campus.id) throw new Error("招生老师不属于所填校区");

        const data = normalizeStudentInput(
          {
            ...input,
            campusId: campus.id,
            classId: studentClass?.id || "",
            academicOwnerId: academicOwner?.id || "",
            salesOwnerId: salesOwner?.id || ""
          },
          { campusId: campus.id }
        );
        await prisma.student.create({ data });
        success += 1;
      } catch (error) {
        errors.push({
          row: index + 2,
          message: error instanceof Error ? error.message : "导入失败"
        });
      }
    }

    return NextResponse.json({ success, failed: errors.length, errors });
  } catch (error) {
    return jsonError(error);
  }
}

function assertRequiredHeaders(rows: Array<Record<string, unknown>>, requiredHeaders: string[]) {
  const headers = new Set(Object.keys(rows[0] || {}));
  const missingHeaders = requiredHeaders.filter((header) => !headers.has(header));
  if (missingHeaders.length) {
    throw new Error(`导入文件缺少关键列：${missingHeaders.join("、")}。请下载模板后按表头填写。`);
  }
}

function assertImportEnums(row: Record<string, unknown>) {
  for (const [field, validValues] of Object.entries(importEnumValues)) {
    const value = String(row[field] || "").trim();
    if (value && !validValues.has(value)) {
      throw new Error(`${field}字段填写无效，请使用模板中的中文值或枚举值`);
    }
  }
}
