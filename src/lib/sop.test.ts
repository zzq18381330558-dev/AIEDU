import assert from "node:assert/strict";
import test from "node:test";
import {
  computeCompletionRate,
  isSopCategory,
  isSopStatus,
  normalizeSopCheckInInput,
  normalizeSopTemplateInput,
  normalizeSopTaskUpdateInput,
  normalizeSopWeeklyReportInput,
  parseStepLines,
  sopLabels
} from "@/lib/sop";

test("normalizeSopTemplateInput validates and maps category labels", () => {
  const input = normalizeSopTemplateInput({
    title: "招生地推 SOP",
    category: "GROUND_PROMOTION",
    status: "ACTIVE",
    summary: "校园地推流程"
  });
  assert.equal(input.category, "GROUND_PROMOTION");
  assert.equal(input.module, sopLabels.categoryGroup.GROUND_PROMOTION);
});

test("parseStepLines supports title and standard syntax", () => {
  const steps = parseStepLines("1. 确认高校点位 | 点位和负责人明确\n执行地推登记");
  assert.equal(steps.length, 2);
  assert.equal(steps[0].title, "确认高校点位");
  assert.equal(steps[0].standard, "点位和负责人明确");
});

test("normalizeSopCheckInInput rejects empty note and keeps status", () => {
  assert.throws(() => normalizeSopCheckInInput({ note: "" }), /打卡说明/);
  const input = normalizeSopCheckInInput({ note: "已完成首轮触达", status: "DONE" });
  assert.equal(input.status, "DONE");
});

test("normalizeSopTaskUpdateInput validates edit payload and completion status", () => {
  assert.throws(() => normalizeSopTaskUpdateInput({ title: "" }), /任务标题/);
  const input = normalizeSopTaskUpdateInput({ title: "复盘校区执行", status: "DONE" });
  assert.equal(input.title, "复盘校区执行");
  assert.equal(input.status, "DONE");
  assert.ok(input.completedAt instanceof Date);
});

test("normalizeSopWeeklyReportInput creates metrics payload", () => {
  const input = normalizeSopWeeklyReportInput({
    campusId: "campus-1",
    summary: "本周完成地推和开班准备",
    leadCount: "20",
    consultCount: "8",
    classCount: "1",
    riskCount: "2"
  });
  assert.equal(input.campusId, "campus-1");
  assert.deepEqual(input.metrics, { leadCount: 20, consultCount: 8, classCount: 1, riskCount: 2 });
});

test("computeCompletionRate returns one decimal percentage", () => {
  assert.equal(computeCompletionRate(1, 3), 33.3);
  assert.equal(computeCompletionRate(0, 0), 0);
});

test("SOP filters reject invalid enum values", () => {
  assert.equal(isSopCategory("GROUND_PROMOTION"), true);
  assert.equal(isSopCategory("BAD_CATEGORY"), false);
  assert.equal(isSopStatus("ACTIVE"), true);
  assert.equal(isSopStatus("BAD_STATUS"), false);
});
