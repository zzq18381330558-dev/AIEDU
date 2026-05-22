import assert from "node:assert/strict";
import test from "node:test";
import { buildDailyReport, buildTrendRows, computeAnalytics } from "./analytics";

test("computeAnalytics calculates conversion and finance estimates", () => {
  const summary = computeAnalytics({
    leads: [
      { id: "l1", campusId: "c1", assigneeId: "u1", sourceChannel: "SHORT_VIDEO", status: "WON", createdAt: new Date(), campus: { name: "总部" }, assignee: { name: "招生 A" } },
      { id: "l2", campusId: "c1", assigneeId: "u1", sourceChannel: "SHORT_VIDEO", status: "CONTACTED", createdAt: new Date(), campus: { name: "总部" }, assignee: { name: "招生 A" } }
    ],
    students: [
      { id: "s1", campusId: "c1", classId: "class1", salesOwnerId: "u1", studyStatus: "STUDYING", campus: { name: "总部" }, class: { name: "周末班" }, salesOwner: { name: "招生 A" } }
    ],
    attendance: [
      { status: "PRESENT", studentId: "s1", courseSession: { homework: "作业", class: { id: "class1", name: "周末班" } } },
      { status: "ABSENT", studentId: "s1", courseSession: { homework: "作业", class: { id: "class1", name: "周末班" } } }
    ],
    classCount: 1
  });

  assert.equal(summary.overview.newLeadCount, 2);
  assert.equal(summary.overview.wonLeadCount, 1);
  assert.equal(summary.overview.conversionRate, 50);
  assert.equal(summary.overview.attendanceRate, 50);
  assert.equal(summary.channelRows[0].conversionRate, 50);
});

test("buildTrendRows creates daily lead rows", () => {
  const rows = buildTrendRows(
    [{ id: "l1", campusId: "c1", assigneeId: null, sourceChannel: "OTHER", status: "WON", createdAt: new Date("2026-05-01T10:00:00+08:00") }],
    [],
    new Date("2026-05-01T00:00:00+08:00"),
    new Date("2026-05-02T23:59:59+08:00")
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[0].leads, 1);
});

test("buildDailyReport writes readable summary", () => {
  const summary = computeAnalytics({ leads: [], students: [], attendance: [], classCount: 0 });
  const report = buildDailyReport(summary, new Date("2026-05-23T08:00:00+08:00"));
  assert.match(report.title, /每日经营日报/);
  assert.match(report.summary, /新增线索/);
});
