import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api";
import {
  canManageQuestionBank,
  questionImportHeaders,
  questionSourceOptions,
  questionTypeOptions,
  subjectOptions
} from "@/lib/question-bank";

function optionText(options: Array<{ value: string; label: string }>) {
  return options.map((item) => `${item.label}（${item.value}）`).join("、");
}

export async function GET() {
  const auth = await requireApiUser("/question-bank");
  if ("response" in auth) return auth.response;
  if (!canManageQuestionBank(auth.user.role)) return NextResponse.json({ error: "无权下载题目导入模板" }, { status: 403 });

  const xlsx = await import("xlsx");
  const workbook = xlsx.utils.book_new();
  const rows = [{
    科目: "综合素质",
    章节: "职业理念",
    知识点: "学生观",
    题型: "单选",
    题干: "下列哪项体现了以人为本的学生观？",
    选项: "A. 尊重学生差异；B. 只看考试成绩；C. 统一学习方式；D. 忽视学生兴趣",
    正确答案: "A",
    解析: "示例解析，可删除",
    难度: 3,
    高频标签: "学生观,职业理念",
    来源: "自编题",
    年份: 2026
  }];
  const templateSheet = xlsx.utils.json_to_sheet(rows, { header: [...questionImportHeaders], skipHeader: false });
  const instructionSheet = xlsx.utils.aoa_to_sheet([
    ["字段", "是否必填", "填写说明"],
    ["科目", "选填", `可填中文或枚举值；中文值：${subjectOptions.map((item) => item.label).join("、")}`],
    ["章节", "选填", "为空时默认“未分类章节”"],
    ["知识点", "选填", "为空时默认“未分类知识点”"],
    ["题型", "选填", `可填中文或枚举值；中文值：${questionTypeOptions.map((item) => item.label).join("、")}`],
    ["题干", "必填", "题目题干，不能为空"],
    ["选项", "选填", "可填 JSON；也可用换行、分号分隔，系统会按 A/B/C 自动拆分"],
    ["正确答案", "必填", "标准答案，不能为空"],
    ["解析", "选填", "题目解析"],
    ["难度", "选填", "1-5，超出范围会自动收敛；为空默认 3"],
    ["高频标签", "选填", "多个标签可用中文逗号、英文逗号、分号或换行分隔"],
    ["来源", "选填", `可填中文或枚举值；中文值：${questionSourceOptions.map((item) => item.label).join("、")}`],
    ["年份", "选填", "如：2026"],
    ["枚举对照", "", `科目：${optionText(subjectOptions)}`],
    ["枚举对照", "", `题型：${optionText(questionTypeOptions)}`],
    ["枚举对照", "", `来源：${optionText(questionSourceOptions)}`]
  ]);

  xlsx.utils.book_append_sheet(workbook, templateSheet, "导入模板");
  xlsx.utils.book_append_sheet(workbook, instructionSheet, "填写说明");

  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename*=UTF-8''question-bank-import-template.xlsx"
    }
  });
}
