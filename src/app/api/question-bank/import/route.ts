import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { canManageQuestionBank, normalizeImportQuestionRow, normalizeQuestionInput } from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";

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
    let success = 0;
    const errors: Array<{ row: number; message: string }> = [];
    for (const [index, row] of rows.entries()) {
      try {
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
