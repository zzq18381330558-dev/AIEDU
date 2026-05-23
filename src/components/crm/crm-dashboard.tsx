"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, Download, FileUp, Pencil, Plus, RefreshCw, Search, TrendingUp } from "lucide-react";
import {
  crmLabels,
  leadImportHeaders,
  leadImportRequiredHeaders,
  leadStatusOptions,
  sourceChannelOptions
} from "@/lib/crm";
import { LeadModal, type LeadModalValue } from "@/components/crm/lead-modal";
import { getUserDisplayName } from "@/lib/user-display";

type Option = { id: string; name?: string | null; email?: string | null; phone?: string | null };
type LeadItem = LeadModalValue & {
  id: string;
  campus?: Option;
  assignee?: Option | null;
  lastFollowedAt?: string | null;
  createdAt: string;
  _count?: { followUps: number };
};

type Group = {
  status?: string;
  sourceChannel?: string;
  _count: { _all: number };
};

export function CrmDashboard({
  initialLeads,
  campuses,
  counselors,
  statusGroups,
  sourceGroups,
  todayCount
}: {
  initialLeads: LeadItem[];
  campuses: Option[];
  counselors: Option[];
  statusGroups: Group[];
  sourceGroups: Group[];
  todayCount: number;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LeadItem | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sourceChannel, setSourceChannel] = useState("");
  const [statusGroupsState, setStatusGroupsState] = useState(statusGroups);
  const [sourceGroupsState, setSourceGroupsState] = useState(sourceGroups);
  const [todayCountState, setTodayCountState] = useState(todayCount);

  const statusSummary = useMemo(
    () => Object.fromEntries(statusGroupsState.map((item) => [item.status || "", item._count._all])),
    [statusGroupsState]
  );

  async function reload(extra?: Record<string, string>) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (sourceChannel) params.set("sourceChannel", sourceChannel);
    for (const [key, value] of Object.entries(extra || {})) {
      if (value) params.set(key, value);
    }
    const response = await fetch(`/api/crm/leads?${params}`);
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "查询失败");
      return;
    }
    setLeads(data.items || []);
    setStatusGroupsState(data.statusGroups || []);
    setSourceGroupsState(data.sourceGroups || []);
    setTodayCountState(data.todayCount || 0);
  }

  async function importFile(formData: FormData) {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      alert("请选择要导入的文件");
      return;
    }
    const headers = await readImportHeaders(file);
    const missingHeaders = leadImportRequiredHeaders.filter((header) => !headers.includes(header));
    if (missingHeaders.length) {
      alert(`导入文件缺少关键列：${missingHeaders.join("、")}。请下载模板后按表头填写。`);
      return;
    }

    const response = await fetch("/api/crm/import", {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "导入失败");
      return;
    }
    alert(`导入完成：成功 ${data.success} 条，失败 ${data.failed} 条`);
    reload();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">招生中心</h1>
            <p className="mt-2 text-sm text-muted">统一管理招生线索、分配跟进、渠道统计和顾问业绩。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/crm/reminders" className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm text-ink">
              <Bell className="h-4 w-4" />
              今日待跟进 {todayCountState}
            </Link>
            <Link href="/crm/performance" className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm text-ink">
              <TrendingUp className="h-4 w-4" />
              业绩统计
            </Link>
            <button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              新建线索
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {leadStatusOptions.map((item) => (
          <div key={item.value} className="rounded-lg border border-line bg-white p-4">
            <div className="text-sm text-muted">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{statusSummary[item.value] || 0}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-line bg-white">
          <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索姓名、手机、微信、学校"
                className="h-10 w-full rounded-md border border-line pl-9 pr-3 text-sm outline-none focus:border-brand-500"
              />
            </div>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
              <option value="">全部状态</option>
              {leadStatusOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <select value={sourceChannel} onChange={(event) => setSourceChannel(event.target.value)} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
              <option value="">全部渠道</option>
              {sourceChannelOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <button onClick={() => reload()} className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm">
              <RefreshCw className="h-4 w-4" />
              查询
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-[#F8FAFB] text-muted">
                <tr>
                  <Th>姓名</Th>
                  <Th>手机/微信</Th>
                  <Th>学校</Th>
                  <Th>方向</Th>
                  <Th>渠道</Th>
                  <Th>校区</Th>
                  <Th>招生老师</Th>
                  <Th>意向</Th>
                  <Th>状态</Th>
                  <Th>下次跟进</Th>
                  <Th>操作</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#FAFBFC]">
                    <Td>
                      <Link href={`/crm/${lead.id}`} className="font-medium text-brand-700">
                        {lead.name}
                      </Link>
                    </Td>
                    <Td>{lead.phone}<div className="text-xs text-muted">{lead.wechat || "-"}</div></Td>
                    <Td>{lead.school || "-"}<div className="text-xs text-muted">{lead.grade || ""} {lead.major || ""}</div></Td>
                    <Td>{crmLabels.examTrack[lead.examTrack as keyof typeof crmLabels.examTrack] || "-"}</Td>
                    <Td>{crmLabels.sourceChannel[lead.sourceChannel as keyof typeof crmLabels.sourceChannel] || "-"}</Td>
                    <Td>{lead.campus?.name || "-"}</Td>
                    <Td>{getUserDisplayName(lead.assignee, "未分配")}</Td>
                    <Td>{crmLabels.intentLevel[lead.intentLevel as keyof typeof crmLabels.intentLevel] || "-"}</Td>
                    <Td>{crmLabels.status[lead.status as keyof typeof crmLabels.status] || "-"}</Td>
                    <Td>{lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleString("zh-CN") : "-"}</Td>
                    <Td>
                      <button
                        onClick={() => {
                          setEditing(lead);
                          setOpen(true);
                        }}
                        className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        编辑
                      </button>
                    </Td>
                  </tr>
                ))}
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-muted">暂无线索</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <form action={importFile} className="rounded-lg border border-line bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <FileUp className="h-4 w-4 text-brand-600" />
                Excel 导入
              </div>
              <a href="/api/crm/import/template" className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs text-ink">
                <Download className="h-3.5 w-3.5" />
                下载模板
              </a>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted">按模板填写，必填列：姓名、手机号。支持表头：{leadImportHeaders.join("、")}。</p>
            <select name="campusId" className="mt-4 h-10 w-full rounded-md border border-line bg-white px-3 text-sm">
              {campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>{campus.name}</option>
              ))}
            </select>
            <select name="assigneeId" className="mt-3 h-10 w-full rounded-md border border-line bg-white px-3 text-sm">
              <option value="">导入后暂不分配</option>
              {counselors.map((user) => (
                <option key={user.id} value={user.id}>{getUserDisplayName(user)}</option>
              ))}
            </select>
            <input name="file" type="file" accept=".xlsx,.xls,.csv" required className="mt-3 w-full text-sm" />
            <button type="submit" className="mt-4 h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white">上传导入</button>
          </form>

          <div className="rounded-lg border border-line bg-white p-4">
            <div className="font-semibold text-ink">来源渠道统计</div>
            <div className="mt-3 space-y-3">
              {sourceGroupsState.map((item) => (
                <div key={item.sourceChannel} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{crmLabels.sourceChannel[item.sourceChannel as keyof typeof crmLabels.sourceChannel]}</span>
                  <span className="font-semibold text-ink">{item._count._all}</span>
                </div>
              ))}
              {sourceGroupsState.length === 0 ? (
                <div className="rounded-md bg-[#F8FAFB] px-3 py-4 text-center text-sm text-muted">暂无渠道数据</div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <LeadModal
        open={open}
        value={editing}
        campuses={campuses}
        counselors={counselors}
        onClose={() => setOpen(false)}
        onSaved={() => reload()}
      />
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-4 py-3 align-top text-ink">{children}</td>;
}

async function readImportHeaders(file: File) {
  if (file.name.toLowerCase().endsWith(".csv")) {
    const text = await file.text();
    const [headerLine = ""] = text.split(/\r?\n/);
    return headerLine.split(",").map((item) => item.trim()).filter(Boolean);
  }

  const xlsx = await import("xlsx");
  const workbook = xlsx.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false });
  return (rows[0] || []).map((item) => String(item).trim()).filter(Boolean);
}
