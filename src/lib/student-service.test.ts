import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAiStudyPlan,
  buildReservedPushPayload,
  buildServiceScript,
  normalizeAttendanceInput,
  normalizeStudentImportRow,
  normalizeServiceRecordInput,
  normalizeStudentInput,
  normalizeStudentStatusInput,
  studentScopeWhere
} from "./student-service";

test("normalizeStudentInput validates and normalizes student profile", () => {
  const result = normalizeStudentInput(
    {
      name: " 王同学 ",
      phone: " 139 0000 0000 ",
      school: "复旦大学",
      examTrack: "MIDDLE",
      studyStatus: "STUDYING"
    },
    { campusId: "campus-1" }
  );

  assert.equal(result.name, "王同学");
  assert.equal(result.phone, "13900000000");
  assert.equal(result.campusId, "campus-1");
  assert.equal(result.examTrack, "MIDDLE");
  assert.equal(result.studyStatus, "STUDYING");
});

test("studentScopeWhere restricts admissions counselor to owned students", () => {
  assert.deepEqual(
    studentScopeWhere({ id: "u1", role: "ADMISSIONS_COUNSELOR", campusId: "c1" }),
    { salesOwnerId: "u1" }
  );
});

test("studentScopeWhere lets admin see all and manager see campus students", () => {
  assert.deepEqual(studentScopeWhere({ id: "admin", role: "ADMIN", campusId: null }), {});
  assert.deepEqual(
    studentScopeWhere({ id: "manager", role: "CAMPUS_MANAGER", campusId: "c1" }),
    { campusId: "c1" }
  );
});

test("studentScopeWhere restricts academic teacher to owned students", () => {
  assert.deepEqual(
    studentScopeWhere({ id: "u2", role: "ACADEMIC_TEACHER", campusId: "c1" }),
    { academicOwnerId: "u2" }
  );
});

test("buildAiStudyPlan includes exam track and service actions", () => {
  const plan = buildAiStudyPlan({
    name: "林小雅",
    school: "上海师范大学",
    grade: "大三",
    major: "汉语言文学",
    classType: "周末班",
    examTrack: "PRIMARY",
    studyStatus: "STUDYING"
  });

  assert.match(plan, /小学教师资格证/);
  assert.match(plan, /上课前 2 小时提醒/);
});

test("buildServiceScript produces teacher-facing copy", () => {
  const script = buildServiceScript({
    name: "林小雅",
    examTrack: "PRIMARY",
    studyStatus: "STUDYING",
    serviceNote: "作文需要重点跟进"
  });

  assert.match(script, /教务老师/);
  assert.match(script, /作文需要重点跟进/);
});

test("buildReservedPushPayload marks provider as reserved", () => {
  const payload = buildReservedPushPayload({
    title: "上课提醒",
    content: "今晚 19:00 上课",
    receiver: "wx-user-1"
  });

  assert.equal(payload.provider, "OPENCLAW_RESERVED");
  assert.equal(payload.ready, false);
  assert.equal(payload.receiver, "wx-user-1");
});

test("normalizeStudentStatusInput supports full study status flow", () => {
  const result = normalizeStudentStatusInput({
    studyStatus: "INTERVIEW_STAGE",
    serviceNote: "进入面试服务阶段"
  });

  assert.equal(result.studyStatus, "INTERVIEW_STAGE");
  assert.equal(result.serviceNote, "进入面试服务阶段");
});

test("normalizeServiceRecordInput validates service timeline records", () => {
  assert.throws(() => normalizeServiceRecordInput({ title: "", content: "" }), /服务记录标题/);

  const result = normalizeServiceRecordInput({
    title: "缺课关怀",
    content: "已联系学员确认补课时间",
    status: "IN_PROGRESS"
  });

  assert.equal(result.status, "IN_PROGRESS");
});

test("normalizeAttendanceInput keeps attendance statuses distinct", () => {
  const present = normalizeAttendanceInput({ status: "PRESENT" });
  const absent = normalizeAttendanceInput({ status: "ABSENT" });
  const leave = normalizeAttendanceInput({ status: "LEAVE", note: "请假" });
  const late = normalizeAttendanceInput({ status: "LATE", checkInAt: "2026-05-23T09:30" });

  assert.equal(present.status, "PRESENT");
  assert.ok(present.checkInAt);
  assert.equal(absent.status, "ABSENT");
  assert.equal(absent.checkInAt, null);
  assert.equal(leave.status, "LEAVE");
  assert.equal(leave.note, "请假");
  assert.equal(late.status, "LATE");
  assert.ok(late.checkInAt);
});

test("normalizeStudentImportRow maps Chinese headers and labels", () => {
  const result = normalizeStudentImportRow({
    姓名: " 陈同学 ",
    手机号: " 138 0000 0001 ",
    校区: "总部校区",
    班级: "周末班",
    教务老师: "王老师",
    招生老师: "张顾问",
    教资方向: "小学",
    学习状态: "学习中",
    服务备注: "重点跟进"
  });

  assert.equal(result.name, "陈同学");
  assert.equal(result.phone, "138 0000 0001");
  assert.equal(result.campusName, "总部校区");
  assert.equal(result.className, "周末班");
  assert.equal(result.academicOwnerName, "王老师");
  assert.equal(result.salesOwnerName, "张顾问");
  assert.equal(result.examTrack, "PRIMARY");
  assert.equal(result.studyStatus, "STUDYING");
  assert.equal(result.serviceNote, "重点跟进");
});
