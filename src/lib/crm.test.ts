import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPerformanceRows,
  getTodayRange,
  leadScopeWhere,
  normalizeFollowUpInput,
  normalizeImportRow,
  normalizeLeadInput
} from "./crm";

test("normalizeLeadInput validates required fields and maps defaults", () => {
  const result = normalizeLeadInput(
    {
      name: " 张三 ",
      phone: " 138 0000 0000 ",
      sourceChannel: "SHORT_VIDEO",
      intentLevel: "STRONG",
      status: "TRIAL"
    },
    { campusId: "campus-1", creatorId: "user-1" }
  );

  assert.equal(result.name, "张三");
  assert.equal(result.phone, "13800000000");
  assert.equal(result.campusId, "campus-1");
  assert.equal(result.examTrack, "PRIMARY");
  assert.equal(result.sourceChannel, "SHORT_VIDEO");
  assert.equal(result.intentLevel, "STRONG");
  assert.equal(result.status, "TRIAL");
});

test("normalizeFollowUpInput rejects empty content", () => {
  assert.throws(() => normalizeFollowUpInput({ content: "" }), /请输入跟进内容/);
});

test("normalizeImportRow accepts Chinese Excel headers and labels", () => {
  const result = normalizeImportRow({
    姓名: "李四",
    手机号: "13900000000",
    教资方向: "中学",
    来源渠道: "高校合作",
    意向等级: "高",
    跟进状态: "考虑中"
  });

  assert.equal(result.name, "李四");
  assert.equal(result.examTrack, "MIDDLE");
  assert.equal(result.sourceChannel, "UNIVERSITY_PARTNERSHIP");
  assert.equal(result.intentLevel, "HIGH");
  assert.equal(result.status, "CONSIDERING");
});

test("getTodayRange returns local day boundaries", () => {
  const { start, end } = getTodayRange(new Date("2026-05-22T15:30:00+08:00"));
  assert.equal(start.getHours(), 0);
  assert.equal(start.getMinutes(), 0);
  assert.equal(end.getTime() - start.getTime(), 24 * 60 * 60 * 1000);
});

test("buildPerformanceRows calculates counselor conversion", () => {
  const rows = buildPerformanceRows(
    [
      { id: "u1", name: "招生 A", campus: { name: "总部校区" } },
      { id: "u2", name: "招生 B", campus: { name: "总部校区" } }
    ],
    [
      { assigneeId: "u1", status: "WON", createdAt: new Date() },
      { assigneeId: "u1", status: "CONTACTED", createdAt: new Date() },
      { assigneeId: "u2", status: "UNCONTACTED", createdAt: new Date() }
    ]
  );

  assert.equal(rows[0].assignedCount, 2);
  assert.equal(rows[0].wonCount, 1);
  assert.equal(rows[0].conversionRate, 50);
  assert.equal(rows[1].contactedCount, 0);
});

test("leadScopeWhere applies role data isolation", () => {
  assert.deepEqual(leadScopeWhere({ id: "admin", role: "ADMIN", campusId: null }), {});
  assert.deepEqual(leadScopeWhere({ id: "manager", role: "CAMPUS_MANAGER", campusId: "c1" }), { campusId: "c1" });
  assert.deepEqual(leadScopeWhere({ id: "sales", role: "ADMISSIONS_COUNSELOR", campusId: "c1" }), {
    assigneeId: "sales"
  });
});
