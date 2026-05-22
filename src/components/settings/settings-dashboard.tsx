"use client";

import { useMemo, useState } from "react";
import { Building2, LibraryBig, Pencil, Plus, RefreshCw, ShieldCheck, UserCog, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  campusStatusOptions,
  dictionaryCategoryOptions,
  settingsLabels,
  settingsRoleOptions,
  userStatusOptions
} from "@/lib/settings";

type Option = { id: string; name: string };

type UserItem = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  campusId?: string | null;
  campus?: Option | null;
};

type CampusItem = {
  id: string;
  name: string;
  code: string;
  city: string;
  managerId?: string | null;
  manager?: Option | null;
  contactPhone?: string | null;
  address?: string | null;
  status: string;
  _count?: { users: number; leads: number; students: number };
};

type DictionaryItem = {
  id: string;
  category: string;
  name: string;
  value?: string | null;
  enabled: boolean;
  sortOrder: number;
};

export function SettingsDashboard({
  initialUsers,
  initialCampuses,
  initialDictionaries,
  managers
}: {
  initialUsers: UserItem[];
  initialCampuses: CampusItem[];
  initialDictionaries: DictionaryItem[];
  managers: Option[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [campuses, setCampuses] = useState(initialCampuses);
  const [dictionaries, setDictionaries] = useState(initialDictionaries);
  const [userModal, setUserModal] = useState<UserItem | "new" | null>(null);
  const [campusModal, setCampusModal] = useState<CampusItem | "new" | null>(null);
  const [dictionaryModal, setDictionaryModal] = useState<DictionaryItem | "new" | null>(null);
  const [category, setCategory] = useState("");

  const filteredDictionaries = useMemo(
    () => dictionaries.filter((item) => !category || item.category === category),
    [category, dictionaries]
  );

  async function reload() {
    const [userResponse, campusResponse, dictionaryResponse] = await Promise.all([
      fetch("/api/settings/users"),
      fetch("/api/settings/campuses"),
      fetch("/api/settings/dictionaries")
    ]);
    const [userData, campusData, dictionaryData] = await Promise.all([
      userResponse.json(),
      campusResponse.json(),
      dictionaryResponse.json()
    ]);
    if (userResponse.ok) setUsers(userData.items || []);
    if (campusResponse.ok) setCampuses(campusData.items || []);
    if (dictionaryResponse.ok) setDictionaries(dictionaryData.items || []);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <UserCog className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-ink">系统设置</h1>
              <p className="mt-2 text-sm text-muted">维护账号、角色、校区和基础业务字典，作为运营配置使用。</p>
            </div>
          </div>
          <button onClick={reload} className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm text-ink">
            <RefreshCw className="h-4 w-4" />
            刷新
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="用户" value={String(users.length)} hint={`${users.filter((item) => item.status === "ACTIVE").length} 个启用账号`} />
        <Metric label="校区" value={String(campuses.length)} hint={`${campuses.filter((item) => item.status === "ACTIVE").length} 个启用校区`} />
        <Metric label="字典项" value={String(dictionaries.length)} hint={`${dictionaries.filter((item) => item.enabled).length} 个启用项`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-line bg-white">
          <PanelHeader icon={UserCog} title="用户管理" action="新建用户" onAction={() => setUserModal("new")} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#F8FAFB] text-muted">
                <tr>
                  <Th>姓名</Th>
                  <Th>邮箱/手机</Th>
                  <Th>角色</Th>
                  <Th>校区</Th>
                  <Th>状态</Th>
                  <Th>操作</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FAFBFC]">
                    <Td className="font-medium">{user.name}</Td>
                    <Td>{user.email}<div className="text-xs text-muted">{user.phone || "-"}</div></Td>
                    <Td>{settingsLabels.role[user.role as keyof typeof settingsLabels.role] || user.role}</Td>
                    <Td>{user.campus?.name || "总部"}</Td>
                    <Td><StatusBadge active={user.status === "ACTIVE"} label={settingsLabels.userStatus[user.status as keyof typeof settingsLabels.userStatus]} /></Td>
                    <Td><EditButton onClick={() => setUserModal(user)} /></Td>
                  </tr>
                ))}
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">暂无用户，可点击新建用户开通账号</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white">
          <PanelHeader icon={ShieldCheck} title="角色管理" />
          <div className="divide-y divide-line">
            {settingsRoleOptions.map((role) => (
              <div key={role.value} className="px-5 py-4">
                <div className="font-medium text-ink">{role.label}</div>
                <div className="mt-1 text-xs leading-5 text-muted">{role.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white">
        <PanelHeader icon={Building2} title="校区管理" action="新建校区" onAction={() => setCampusModal("new")} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-[#F8FAFB] text-muted">
              <tr>
                <Th>校区</Th>
                <Th>城市</Th>
                <Th>负责人</Th>
                <Th>联系方式</Th>
                <Th>状态</Th>
                <Th>数据</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {campuses.map((campus) => (
                <tr key={campus.id} className="hover:bg-[#FAFBFC]">
                  <Td><span className="font-medium">{campus.name}</span><div className="text-xs text-muted">{campus.code}</div></Td>
                  <Td>{campus.city}</Td>
                  <Td>{campus.manager?.name || "-"}</Td>
                  <Td>{campus.contactPhone || "-"}</Td>
                  <Td><StatusBadge active={campus.status === "ACTIVE"} label={settingsLabels.campusStatus[campus.status as keyof typeof settingsLabels.campusStatus]} /></Td>
                  <Td>{campus._count?.users || 0} 用户 / {campus._count?.students || 0} 学员</Td>
                  <Td><EditButton onClick={() => setCampusModal(campus)} /></Td>
                </tr>
              ))}
              {campuses.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted">暂无校区，可点击新建校区完善基础信息</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white">
        <PanelHeader icon={LibraryBig} title="业务字典" action="新建字典项" onAction={() => setDictionaryModal("new")} />
        <div className="border-b border-line p-4">
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-md border border-line bg-white px-3 text-sm">
            <option value="">全部分类</option>
            {dictionaryCategoryOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#F8FAFB] text-muted">
              <tr>
                <Th>分类</Th>
                <Th>名称</Th>
                <Th>值</Th>
                <Th>排序</Th>
                <Th>状态</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredDictionaries.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAFBFC]">
                  <Td>{settingsLabels.dictionaryCategory[item.category as keyof typeof settingsLabels.dictionaryCategory]}</Td>
                  <Td className="font-medium">{item.name}</Td>
                  <Td>{item.value || "-"}</Td>
                  <Td>{item.sortOrder}</Td>
                  <Td><StatusBadge active={item.enabled} label={item.enabled ? "启用" : "停用"} /></Td>
                  <Td><EditButton onClick={() => setDictionaryModal(item)} /></Td>
                </tr>
              ))}
              {filteredDictionaries.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">暂无字典项</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <UserModal open={Boolean(userModal)} value={userModal === "new" ? null : userModal} campuses={campuses} onClose={() => setUserModal(null)} onSaved={reload} />
      <CampusModal open={Boolean(campusModal)} value={campusModal === "new" ? null : campusModal} managers={managers} onClose={() => setCampusModal(null)} onSaved={reload} />
      <DictionaryModal open={Boolean(dictionaryModal)} value={dictionaryModal === "new" ? null : dictionaryModal} onClose={() => setDictionaryModal(null)} onSaved={reload} />
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-3 text-2xl font-semibold text-ink">{value}</div>
      <div className="mt-2 text-xs text-muted">{hint}</div>
    </div>
  );
}

function PanelHeader({ icon: Icon, title, action, onAction }: { icon: LucideIcon; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
      <div className="flex items-center gap-2 font-semibold text-ink">
        <Icon className="h-4 w-4 text-brand-600" />
        {title}
      </div>
      {action ? (
        <button onClick={onAction} className="inline-flex h-9 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" />
          {action}
        </button>
      ) : null}
    </div>
  );
}

function StatusBadge({ active, label }: { active: boolean; label?: string }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs ${active ? "bg-brand-50 text-brand-700" : "bg-[#F2F4F7] text-muted"}`}>
      {label || (active ? "启用" : "停用")}
    </span>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs">
      <Pencil className="h-3.5 w-3.5" />
      编辑
    </button>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-4 py-3 text-ink ${className}`}>{children}</td>;
}

function BaseModal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-md p-2 text-muted hover:bg-[#F2F4F7]">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function UserModal({ open, value, campuses, onClose, onSaved }: { open: boolean; value: UserItem | null; campuses: CampusItem[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const roleOptions: Array<{ value: string; label: string }> = settingsRoleOptions.map((item) => ({
    value: item.value,
    label: item.label
  }));
  if (value?.role && !roleOptions.some((item) => item.value === value.role)) {
    roleOptions.push({
      value: value.role,
      label: settingsLabels.role[value.role as keyof typeof settingsLabels.role] || value.role
    });
  }

  return (
    <BaseModal open={open} title={value ? "编辑用户" : "新建用户"} onClose={onClose}>
      <EntityForm endpoint={value ? `/api/settings/users/${value.id}` : "/api/settings/users"} method={value ? "PUT" : "POST"} onClose={onClose} onSaved={onSaved}>
        <Field label="姓名" name="name" required defaultValue={value?.name} />
        <Field label="登录邮箱" name="email" type="email" required defaultValue={value?.email} />
        <Field label="手机号" name="phone" defaultValue={value?.phone} />
        {!value ? <Field label="初始密码" name="password" type="password" defaultValue="Admin@123456" /> : null}
        <Select label="用户角色" name="role" options={roleOptions} defaultValue={value?.role || "ADMISSIONS_COUNSELOR"} />
        <Select label="所属校区" name="campusId" options={[{ value: "", label: "总部/不绑定校区" }, ...campuses.map((item) => ({ value: item.id, label: item.name }))]} defaultValue={value?.campusId || ""} />
        <Select label="用户状态" name="status" options={userStatusOptions} defaultValue={value?.status || "ACTIVE"} />
      </EntityForm>
    </BaseModal>
  );
}

function CampusModal({ open, value, managers, onClose, onSaved }: { open: boolean; value: CampusItem | null; managers: Option[]; onClose: () => void; onSaved: () => Promise<void> }) {
  return (
    <BaseModal open={open} title={value ? "编辑校区" : "新建校区"} onClose={onClose}>
      <EntityForm endpoint={value ? `/api/settings/campuses/${value.id}` : "/api/settings/campuses"} method={value ? "PUT" : "POST"} onClose={onClose} onSaved={onSaved}>
        <Field label="校区名称" name="name" required defaultValue={value?.name} />
        <Field label="校区编码" name="code" required defaultValue={value?.code} />
        <Field label="城市" name="city" required defaultValue={value?.city} />
        <Select label="负责人" name="managerId" options={[{ value: "", label: "暂不指定" }, ...managers.map((item) => ({ value: item.id, label: item.name }))]} defaultValue={value?.managerId || ""} />
        <Field label="联系方式" name="contactPhone" defaultValue={value?.contactPhone} />
        <Select label="校区状态" name="status" options={campusStatusOptions} defaultValue={value?.status || "ACTIVE"} />
        <label className="md:col-span-2">
          <span className="text-sm font-medium text-ink">地址</span>
          <textarea name="address" defaultValue={value?.address || ""} rows={3} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
        </label>
      </EntityForm>
    </BaseModal>
  );
}

function DictionaryModal({ open, value, onClose, onSaved }: { open: boolean; value: DictionaryItem | null; onClose: () => void; onSaved: () => Promise<void> }) {
  return (
    <BaseModal open={open} title={value ? "编辑字典项" : "新建字典项"} onClose={onClose}>
      <EntityForm endpoint={value ? `/api/settings/dictionaries/${value.id}` : "/api/settings/dictionaries"} method={value ? "PUT" : "POST"} onClose={onClose} onSaved={onSaved}>
        <Select label="分类" name="category" options={dictionaryCategoryOptions} defaultValue={value?.category || "SCHOOL"} />
        <Field label="名称" name="name" required defaultValue={value?.name} />
        <Field label="值" name="value" defaultValue={value?.value} />
        <Field label="排序" name="sortOrder" type="number" defaultValue={String(value?.sortOrder ?? 0)} />
        <Select label="状态" name="enabled" options={[{ value: "true", label: "启用" }, { value: "false", label: "停用" }]} defaultValue={String(value?.enabled ?? true)} />
      </EntityForm>
    </BaseModal>
  );
}

function EntityForm({ endpoint, method, children, onClose, onSaved }: { endpoint: string; method: "POST" | "PUT"; children: React.ReactNode; onClose: () => void; onSaved: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData) {
    setSaving(true);
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(data.error || "保存失败");
      setSaving(false);
      return;
    }
    await onSaved();
    setSaving(false);
    onClose();
  }

  return (
    <form action={submit} className="grid gap-4 p-5 md:grid-cols-2">
      {children}
      <div className="flex justify-end gap-3 md:col-span-2">
        <button type="button" onClick={onClose} className="h-10 rounded-md border border-line px-4 text-sm text-muted">取消</button>
        <button disabled={saving} type="submit" className="h-10 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, name, defaultValue, type = "text", required }: { label: string; name: string; defaultValue?: string | null; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input name={name} type={type} required={required} defaultValue={defaultValue || ""} className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
    </label>
  );
}

function Select({ label, name, options, defaultValue }: { label: string; name: string; options: Array<{ value: string; label: string }>; defaultValue?: string }) {
  return (
    <label>
      <span className="text-sm font-medium text-ink">{label}</span>
      <select name={name} defaultValue={defaultValue} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
