import { NextRequest, NextResponse } from "next/server";
import type { QuestionSource } from "@prisma/client";
import { jsonError, requireApiUser } from "@/lib/api";
import {
  canManageQuestionBank,
  normalizePaperQuestionImportRow,
  paperQuestionImportRequiredHeaders,
  validateImportHeaders
} from "@/lib/question-bank";
import { prisma } from "@/lib/prisma";

async function rowsFromFile(file: File) {
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".csv")) {
    const text = buffer.toString("utf8");
    const [headerLine = "", ...lines] = text.split(/\r?\n/).filter(Boolean);
    const headers = headerLine.split(",").map((item) => item.trim());
    validateImportHeaders(headers, paperQuestionImportRequiredHeaders);
    return lines.map((line) => {
      const cells = line.split(",");
      return Object.fromEntries(headers.map((header, index) => [header, cells[index]?.trim() || ""]));
    });
  }

  const xlsx = await import("xlsx");
  const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  validateImportHeaders(Object.keys(rows[0] || {}), paperQuestionImportRequiredHeaders);
  return rows;
}

function sourceFromPaperType(paperType: string): QuestionSource {
  if (paperType === "REAL_EXAM") return "REAL_EXAM";
  if (paperType === "MOCK") return "MOCK";
  return "ORIGINAL";
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;
  if (!canManageQuestionBank(auth.user.role)) return NextResponse.json({ error: "无权成套导入试卷" }, { status: 403 });

  try {
    const { id } = await context.params;
    const paper = await prisma.examPaper.findUnique({ where: { id } });
    if (!paper) return NextResponse.json({ error: "试卷不存在或已被删除" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("请上传 Excel 或 CSV 文件");

    const rows = await rowsFromFile(file);
    if (rows.length === 0) throw new Error("导入文件没有题目数据");

    const errors: Array<{ row: number; message: string }> = [];
    const data = rows.map((row, index) => {
      try {
        return normalizePaperQuestionImportRow(row, {
          paperId: paper.id,
          subject: paper.subject,
          year: paper.year,
          source: sourceFromPaperType(paper.paperType)
        });
      } catch (error) {
        errors.push({ row: index + 2, message: error instanceof Error ? error.message : "题目数据无效" });
        return null;
      }
    });

    if (errors.length) {
      return NextResponse.json({ error: "成套导入失败，请修正错误行后重试", errors }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of data) {
        if (item) await tx.question.create({ data: item });
      }
      const questionCount = await tx.question.count({ where: { paperId: paper.id } });
      await tx.examPaper.update({
        where: { id: paper.id },
        data: { questionCount }
      });
    });

    const questionCount = await prisma.question.count({ where: { paperId: paper.id } });
    return NextResponse.json({ success: data.length, failed: 0, questionCount });
  } catch (error) {
    return jsonError(error);
  }
}
