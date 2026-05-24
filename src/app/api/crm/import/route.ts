import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { leadImportRequiredHeaders, normalizeImportRow, normalizeLeadInput } from "@/lib/crm";
import { canAccessCampusId } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

const importEnumValues = {
  教资方向: new Set(["幼儿", "小学", "中学", "INFANT", "PRIMARY", "MIDDLE"]),
  来源渠道: new Set([
    "高校合作",
    "校园推广",
    "朋友圈",
    "短视频",
    "地推",
    "企业微信",
    "转介绍",
    "其他",
    "UNIVERSITY_PARTNERSHIP",
    "CAMPUS_PROMOTION",
    "WECHAT_MOMENTS",
    "SHORT_VIDEO",
    "GROUND_PROMOTION",
    "ENTERPRISE_WECHAT",
    "REFERRAL",
    "OTHER"
  ]),
  意向等级: new Set(["低", "中", "高", "强", "LOW", "MEDIUM", "HIGH", "STRONG"]),
  跟进状态: new Set(["未联系", "已联系", "试听", "考虑中", "已成交", "已流失", "UNCONTACTED", "CONTACTED", "TRIAL", "CONSIDERING", "WON", "LOST"])
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
  const auth = await requireApiUser("/crm");
  if ("response" in auth) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const campusId = String(formData.get("campusId") || auth.user.campusId || "");
    const assigneeId = String(formData.get("assigneeId") || "");

    if (!(file instanceof File)) throw new Error("请上传 Excel 或 CSV 文件");
    if (!campusId) throw new Error("请选择导入线索所属校区");
    if (!(await canAccessCampusId(auth.user, campusId, { activeOnly: true }))) {
      return NextResponse.json({ error: "无权限操作该校区数据" }, { status: 403 });
    }

    const rows = await rowsFromFile(file);
    assertRequiredHeaders(rows, [...leadImportRequiredHeaders]);
    const normalizedRows = rows.map((row) => ({
      ...assertImportEnums(row),
      ...normalizeImportRow(row),
      campusId,
      assigneeId: assigneeId || normalizeImportRow(row).assigneeId
    }));

    let success = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (const [index, row] of normalizedRows.entries()) {
      try {
        const data = normalizeLeadInput(row, { campusId, creatorId: auth.user.id });
        await prisma.lead.create({ data });
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
  return {};
}
