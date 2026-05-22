import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { canManageQuestionBank, normalizeImportQuestionRow, normalizeQuestionInput, questionImportRequiredHeaders } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";

const importEnumValues = {
  科目: new Set(["综合素质", "教育知识与能力", "学科知识", "面试结构化", "试讲", "答辩", "COMPREHENSIVE_QUALITY", "EDUCATION_KNOWLEDGE", "SUBJECT_KNOWLEDGE", "INTERVIEW_STRUCTURED", "TRIAL_LECTURE", "DEFENSE"]),
  题型: new Set(["单选", "材料分析", "作文", "简答", "辨析", "案例分析", "SINGLE_CHOICE", "MATERIAL_ANALYSIS", "WRITING", "SHORT_ANSWER", "DISCRIMINATION", "CASE_ANALYSIS"]),
  来源: new Set(["真题", "模拟题", "自编题", "REAL_EXAM", "MOCK", "ORIGINAL"])
} satisfies Record<string, Set<string>>;

async function rowsFromFile(file: File) {
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".csv")) {
    const text = buffer.toString("utf8");
    const [headerLine = "", ...lines] = text.split(/\r?\n/).filter(Boolean);
    const headers = headerLine.split(",").map((item) => item.trim());
    return lines.map((line) => {
      const cells = line.split(",");
      return Object.fromEntries(headers.map((header, index) => [header, cells[index]?.trim() || ""]));
    });
  }

  const xlsx = await import("xlsx");
  const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;
  if (!canManageQuestionBank(auth.user.role)) return NextResponse.json({ error: "无权导入题目" }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("请上传 Excel 或 CSV 文件");

    const rows = await rowsFromFile(file);
    assertRequiredHeaders(rows, [...questionImportRequiredHeaders]);
    let success = 0;
    const errors: Array<{ row: number; message: string }> = [];
    for (const [index, row] of rows.entries()) {
      try {
        assertImportEnums(row);
        await prisma.question.create({
          data: normalizeQuestionInput(normalizeImportQuestionRow(row))
        });
        success += 1;
      } catch (error) {
        errors.push({ row: index + 2, message: error instanceof Error ? error.message : "导入失败" });
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
