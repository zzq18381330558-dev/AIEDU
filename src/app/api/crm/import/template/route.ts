import { NextResponse } from "next/server";
import {
  examTrackOptions,
  intentLevelOptions,
  leadImportHeaders,
  leadStatusOptions,
  sourceChannelOptions
} from "@/lib/crm";
import { requireApiUser } from "@/lib/api";

function optionText(options: Array<{ value: string; label: string }>) {
  return options.map((item) => `${item.label}（${item.value}）`).join("、");
}

export async function GET() {
  const auth = await requireApiUser("/crm");
  if ("response" in auth) return auth.response;

  const xlsx = await import("xlsx");
  const workbook = xlsx.utils.book_new();
  const rows = [{
    姓名: "张三",
    手机号: "13800000000",
    微信号: "zhangsan",
    学校: "示例大学",
    年级: "大三",
    专业: "汉语言文学",
    教资方向: "小学",
    来源渠道: "校园推广",
    意向等级: "中",
    跟进状态: "未联系",
    下次跟进时间: "2026-06-01 10:00",
    备注: "示例行，可删除"
  }];
  const templateSheet = xlsx.utils.json_to_sheet(rows, { header: [...leadImportHeaders], skipHeader: false });
  const instructionSheet = xlsx.utils.aoa_to_sheet([
    ["字段", "是否必填", "填写说明"],
    ["姓名", "必填", "线索姓名，不能为空"],
    ["手机号", "必填", "线索手机号，不能为空；系统会自动去除空格"],
    ["微信号", "选填", "微信号或企微备注"],
    ["学校", "选填", "学生所在学校"],
    ["年级", "选填", "如：大一、大二、大三、研一"],
    ["专业", "选填", "学生专业"],
    ["教资方向", "选填", `可填中文或枚举值；中文值：${examTrackOptions.map((item) => item.label).join("、")}`],
    ["来源渠道", "选填", `可填中文或枚举值；中文值：${sourceChannelOptions.map((item) => item.label).join("、")}`],
    ["意向等级", "选填", `可填中文或枚举值；中文值：${intentLevelOptions.map((item) => item.label).join("、")}`],
    ["跟进状态", "选填", `可填中文或枚举值；中文值：${leadStatusOptions.map((item) => item.label).join("、")}`],
    ["下次跟进时间", "选填", "建议格式：YYYY-MM-DD HH:mm"],
    ["备注", "选填", "补充说明"],
    ["枚举对照", "", `教资方向：${optionText(examTrackOptions)}`],
    ["枚举对照", "", `来源渠道：${optionText(sourceChannelOptions)}`],
    ["枚举对照", "", `意向等级：${optionText(intentLevelOptions)}`],
    ["枚举对照", "", `跟进状态：${optionText(leadStatusOptions)}`]
  ]);

  xlsx.utils.book_append_sheet(workbook, templateSheet, "导入模板");
  xlsx.utils.book_append_sheet(workbook, instructionSheet, "填写说明");

  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename*=UTF-8''crm-leads-import-template.xlsx"
    }
  });
}
