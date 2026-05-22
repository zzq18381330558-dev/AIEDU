"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Download, FileText } from "lucide-react";

type Row = Record<string, string | number>;
type Summary = {
  overview: Record<string, number>;
  channelRows: Row[];
  campusRows: Row[];
  counselorRows: Row[];
  classRows: Row[];
  weakKnowledgeRows: Row[];
  trends: Array<{ date: string; leads: number; won: number; students: number }>;
};

export function AnalyticsDashboard({
  summary,
  campuses,
  counselors
}: {
  summary: Summary;
  campuses: Array<{ id: string; name: string }>;
  counselors: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function apply(formData: FormData) {
    const next = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (value) next.set(key, String(value));
    }
    router.push(`/analytics?${next}`);
  }

  async function dailyReport() {
    const response = await fetch(`/api/analytics/daily-report?${params}`, { method: "POST" });
    if (!response.ok) {
      alert("日报生成失败");
      return;
    }
    alert("每日经营日报已生成");
    router.refresh();
  }

  const p = summary.overview;
  const hasAnyData = p.newLeadCount + p.wonLeadCount + p.attendanceRecordCount + p.wrongQuestionCount + summary.classRows.length > 0;
  return (
    <div className="space-y-6">
      <form action={apply} className="grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-5">
        <input name="from" type="date" defaultValue={params.get("from") || ""} className="h-10 rounded-md border border-line px-3 text-sm" />
        <input name="to" type="date" defaultValue={params.get("to") || ""} className="h-10 rounded-md border border-line px-3 text-sm" />
        <select name="campusId" defaultValue={params.get("campusId") || ""} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
          <option value="">全部校区</option>
          {campuses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select name="assigneeId" defaultValue={params.get("assigneeId") || ""} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
          <option value="">全部招生老师</option>
          {counselors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <button className="h-10 rounded-md bg-brand-600 text-sm font-semibold text-white">筛选</button>
      </form>

      <div className="flex flex-wrap gap-3">
        <a href={`/api/analytics/export?${params}`} className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm">
          <Download className="h-4 w-4" />
          导出 Excel
        </a>
        <button onClick={dailyReport} className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm">
          <FileText className="h-4 w-4" />
          生成每日经营日报
        </button>
      </div>

      {!hasAnyData ? (
        <div className="rounded-lg border border-dashed border-line bg-white p-6 text-center text-sm text-muted">
          当前筛选条件下暂无经营数据，请调整日期、校区或招生老师后再查看。
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="新建线索" value={p.newLeadCount} />
        <Metric label="有效咨询" value={p.effectiveConsultCount} />
        <Metric label="成交人数" value={p.wonLeadCount} />
        <Metric label="成交金额" value={`¥${p.revenue}`} />
        <Metric label="转化率" value={`${p.conversionRate}%`} />
        <Metric label="利润估算" value={`¥${p.profit}`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="总部数据看板">
          <MiniBars rows={summary.trends.map((item) => ({ name: item.date.slice(5), value: item.leads }))} />
        </Panel>
        <Panel title="财务简报">
          <div className="grid gap-3 md:grid-cols-2">
            <Metric label="高校分成金额" value={`¥${p.universityShare}`} compact />
            <Metric label="老师课时费" value={`¥${p.teacherFee}`} compact />
            <Metric label="退费率" value={`${p.refundRate}%`} compact />
            <Metric label="校区利润估算" value={`¥${p.profit}`} compact />
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Table title="各渠道转化率" rows={summary.channelRows} columns={["name", "leadCount", "wonCount", "conversionRate"]} />
        <Table title="各校区业绩" rows={summary.campusRows} columns={["name", "leadCount", "wonCount", "revenue", "conversionRate"]} />
        <Table title="招生老师业绩" rows={summary.counselorRows} columns={["name", "leadCount", "consultCount", "wonCount", "conversionRate"]} />
        <Table title="教务服务看板" rows={summary.classRows} columns={["name", "studentCount", "attendanceRate", "absenceRate"]} />
        <Table title="薄弱知识点" rows={summary.weakKnowledgeRows} columns={["subject", "chapter", "knowledgePoint", "wrong", "unmastered", "avgDifficulty"]} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="学员到课率" value={`${p.attendanceRate}%`} />
        <Metric label="学员打卡率" value={`${p.checkInRate}%`} />
        <Metric label="学员缺课率" value={`${p.absenceRate}%`} />
        <Metric label="错题数" value={p.wrongQuestionCount} />
        <Metric label="薄弱知识点" value={p.weakKnowledgePointCount} />
        <Metric label="作业完成率" value={`${p.homeworkCompletionRate}%`} />
      </section>
    </div>
  );
}

function Metric({ label, value, compact = false }: { label: string; value: string | number; compact?: boolean }) {
  return <div className={`rounded-lg border border-line bg-white ${compact ? "p-4" : "p-5"}`}><div className="text-sm text-muted">{label}</div><div className="mt-2 text-2xl font-semibold text-ink">{value}</div></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-line bg-white p-5"><h2 className="font-semibold text-ink">{title}</h2><div className="mt-4">{children}</div></div>;
}

function MiniBars({ rows }: { rows: Array<{ name: string; value: number }> }) {
  const max = Math.max(1, ...rows.map((item) => item.value));
  return <div className="flex h-48 items-end gap-2">{rows.slice(-14).map((item) => <div key={item.name} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t bg-brand-500" style={{ height: `${Math.max(4, (item.value / max) * 150)}px` }} /><div className="text-[10px] text-muted">{item.name}</div></div>)}</div>;
}

function Table({ title, rows, columns }: { title: string; rows: Row[]; columns: string[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="border-b border-line px-5 py-4 font-semibold text-ink">{title}</div>
      <table className="w-full text-left text-sm">
        <thead className="bg-[#F8FAFB] text-muted"><tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-medium">{column}</th>)}</tr></thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => <tr key={String(row.name)}>{columns.map((column) => <td key={column} className="px-4 py-3 text-ink">{row[column] ?? "-"}</td>)}</tr>)}
          {rows.length === 0 ? <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-muted">暂无数据</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}
