import { NextResponse } from "next/server";
import { examTrackOptions } from "@/lib/crm";
import { requireApiUser } from "@/lib/api";
import { studentImportHeaders, studyStatusOptions } from "@/lib/student-service";

function optionText(options: Array<{ value: string; label: string }>) {
  return options.map((item) => `${item.label}（${item.value}）`).join("、");
}

export async function GET() {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;
  if (auth.user.role === "ADMISSIONS_COUNSELOR") {
    return NextResponse.json({ error: "招生老师无权下载学员导入模板" }, { status: 403 });
  }

  const xlsx = await import("xlsx");
  const workbook = xlsx.utils.book_new();
  const rows = [{
    姓名: "李同学",
    手机号: "13800000000",
    身份证号: "51112419920314621X",
    学校: "示例大学",
    年级: "大三",
    专业: "汉语言文学",
    报名班型: "周末冲刺班",
    校区: "总部校区",
    班级: "小学教资周末班",
    教务老师: "王老师",
    招生老师: "张顾问",
    教资方向: "小学",
    学习状态: "未开学",
    服务备注: "示例行，可删除"
  }];
  const templateSheet = xlsx.utils.json_to_sheet(rows, { header: [...studentImportHeaders], skipHeader: false });
  const instructionSheet = xlsx.utils.aoa_to_sheet([
    ["字段", "是否必填", "填写说明"],
    ["姓名", "必填", "学员姓名，不能为空"],
    ["手机号", "必填", "学员手机号，不能为空；系统会自动去除空格"],
    ["身份证号", "选填", "支持 15 位或 18 位，18 位最后一位可为 X"],
    ["学校", "选填", "学生所在学校"],
    ["年级", "选填", "如：大一、大二、大三、研一"],
    ["专业", "选填", "学生专业"],
    ["报名班型", "选填", "如：周末冲刺班、寒假集训班"],
    ["校区", "必填", "填写系统内已有校区名称或 id"],
    ["班级", "选填", "填写系统内已有班级名称或 id；班级必须属于所填校区"],
    ["教务老师", "选填", "填写系统内已有教务老师姓名或 id"],
    ["招生老师", "选填", "填写系统内已有招生老师姓名或 id"],
    ["教资方向", "选填", `可填中文或枚举值；中文值：${examTrackOptions.map((item) => item.label).join("、")}`],
    ["学习状态", "选填", `可填中文或枚举值；中文值：${studyStatusOptions.map((item) => item.label).join("、")}`],
    ["服务备注", "选填", "补充服务说明"],
    ["枚举对照", "", `教资方向：${optionText(examTrackOptions)}`],
    ["枚举对照", "", `学习状态：${optionText(studyStatusOptions)}`]
  ]);

  xlsx.utils.book_append_sheet(workbook, templateSheet, "导入模板");
  xlsx.utils.book_append_sheet(workbook, instructionSheet, "填写说明");

  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename*=UTF-8''student-service-import-template.xlsx"
    }
  });
}
