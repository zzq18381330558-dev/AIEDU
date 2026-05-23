"use client";

import { useMemo, useState } from "react";
import { Building2, ChevronDown, ChevronRight, LibraryBig, Pencil, Plus, RefreshCw, ShieldCheck, UserCog, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  campusStatusOptions,
  dictionaryCategoryOptions,
  settingsLabels,
  settingsRoleOptions,
  userStatusOptions
} from "@/lib/settings";
import { getUserDisplayName } from "@/lib/user-display";

type Option = { id: string; name?: string | null; email?: string | null; phone?: string | null };

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
  const [openUserGroups, setOpenUserGroups] = useState<Record<string, boolean>>({});
  const [openDictionaryGroups, setOpenDictionaryGroups] = useState<Record<string, boolean>>({});

  const filteredDictionaries = useMemo(
    () => dictionaries.filter((item) => !category || item.category === category),
    [category, dictionaries]
  );
  const dictionaryCategoryChoices = useMemo(() => {
    const options = new Map<string, string>();
    for (const item of dictionaryCategoryOptions) options.set(item.value, item.label);
    for (const item of dictionaries) options.set(item.category, getDictionaryCategoryLabel(item.category));
    return Array.from(options, ([value, label]) => ({ value, label }));
  }, [dictionaries]);
  const dictionaryGroups = useMemo(() => {
    const groups = new Map<string, DictionaryItem[]>();
    for (const item of filteredDictionaries) {
      const current = groups.get(item.category) || [];
      current.push(item);
      groups.set(item.category, current);
    }
    return Array.from(groups, ([categoryName, items]) => ({
      category: categoryName,
      label: getDictionaryCategoryLabel(categoryName),
      items
    })).sort((a, b) => a.label.localeCompare(b.label, "zh-CN"));
  }, [filteredDictionaries]);
  const userRoleGroups = useMemo(
    () =>
      (["ADMIN", "HQ_OPERATIONS", "CAMPUS_MANAGER", "ADMISSIONS_COUNSELOR", "ACADEMIC_TEACHER", "LECTURER"] as const).map(
        (role) => ({
          role,
          label: settingsLabels.role[role],
          users: users.filter((item) => item.role === role)
        })
      ),
    [users]
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

  async function saveEntity(endpoint: string, payload: Record<string, unknown>) {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(data.error || "保存失败");
      return;
    }
    await reload();
  }

  async function toggleUser(user: UserItem) {
    await saveEntity(`/api/settings/users/${user.id}`, {
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      campusId: user.campusId || "",
      status: user.status === "ACTIVE" ? "DISABLED" : "ACTIVE"
    });
  }

  async function toggleCampus(campus: CampusItem) {
    await saveEntity(`/api/settings/campuses/${campus.id}`, {
      name: campus.name,
      code: campus.code,
      city: campus.city,
      managerId: campus.managerId || "",
      contactPhone: campus.contactPhone || "",
      address: campus.address || "",
      status: campus.status === "ACTIVE" ? "DISABLED" : "ACTIVE"
    });
  }

  async function toggleDictionary(item: DictionaryItem) {
    await saveEntity(`/api/settings/dictionaries/${item.id}`, {
      category: item.category,
      name: item.name,
      value: item.value || "",
      sortOrder: String(item.sortOrder),
      enabled: item.enabled ? "false" : "true"
    });
  }

  function toggleUserGroup(role: string) {
    setOpenUserGroups((current) => ({ ...current, [role]: !current[role] }));
  }

  function toggleDictionaryGroup(categoryName: string) {
    setOpenDictionaryGroups((current) => ({ ...current, [categoryName]: !current[categoryName] }));
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
              <tbody className="divide-y divide-line">
                {userRoleGroups.map((group) => (
                  <RoleUserRows
                    key={group.role}
                    label={group.label}
                    users={group.users}
                    open={Boolean(openUserGroups[group.role])}
                    onToggleOpen={() => toggleUserGroup(group.role)}
                    onEdit={setUserModal}
                    onToggle={toggleUser}
                  />
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
          <div className="border-b border-line px-5 py-4 text-sm leading-6 text-muted">
            当前版本使用固定 5 类基础角色；历史总部运营账号仅做兼容展示。自定义角色将在后续权限模块中实现，本轮不新增动态角色表。
          </div>
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
                <tr key={campus.id} className={campus.status === "ACTIVE" ? "hover:bg-[#FAFBFC]" : "bg-[#FAFBFC] text-muted"}>
                  <Td><span className="font-medium">{campus.name}</span><div className="text-xs text-muted">{campus.code}</div></Td>
                  <Td>{campus.city}</Td>
                  <Td>{getUserDisplayName(campus.manager)}</Td>
                  <Td>{campus.contactPhone || "-"}</Td>
                  <Td><StatusBadge active={campus.status === "ACTIVE"} label={settingsLabels.campusStatus[campus.status as keyof typeof settingsLabels.campusStatus]} /></Td>
                  <Td>{campus._count?.users || 0} 用户 / {campus._count?.students || 0} 学员</Td>
                  <Td><RowActions active={campus.status === "ACTIVE"} onEdit={() => setCampusModal(campus)} onToggle={() => toggleCampus(campus)} /></Td>
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
            {dictionaryCategoryChoices.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <tbody className="divide-y divide-line">
              {dictionaryGroups.map((group) => (
                <DictionaryRows
                  key={group.category}
                  label={group.label}
                  items={group.items}
                  open={Boolean(openDictionaryGroups[group.category])}
                  onToggleOpen={() => toggleDictionaryGroup(group.category)}
                  onEdit={setDictionaryModal}
                  onToggle={toggleDictionary}
                />
              ))}
              {dictionaryGroups.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">暂无字典项</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <UserModal open={Boolean(userModal)} value={userModal === "new" ? null : userModal} campuses={campuses} onClose={() => setUserModal(null)} onSaved={reload} />
      <CampusModal open={Boolean(campusModal)} value={campusModal === "new" ? null : campusModal} managers={managers} onClose={() => setCampusModal(null)} onSaved={reload} />
      <DictionaryModal
        open={Boolean(dictionaryModal)}
        value={dictionaryModal === "new" ? null : dictionaryModal}
        categories={dictionaryCategoryChoices}
        onClose={() => setDictionaryModal(null)}
        onSaved={reload}
      />
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

function ToggleButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex h-8 items-center rounded-md border border-line px-2 text-xs">
      {active ? "停用" : "启用"}
    </button>
  );
}

function RowActions({ active, onEdit, onToggle }: { active: boolean; onEdit: () => void; onToggle: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <EditButton onClick={onEdit} />
      <ToggleButton active={active} onClick={onToggle} />
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-4 py-3 text-ink ${className}`}>{children}</td>;
}

function getDictionaryCategoryLabel(categoryName: string) {
  return settingsLabels.dictionaryCategory[categoryName as keyof typeof settingsLabels.dictionaryCategory] || categoryName;
}

function RoleUserRows({
  label,
  users,
  open,
  onToggleOpen,
  onEdit,
  onToggle
}: {
  label: string;
  users: UserItem[];
  open: boolean;
  onToggleOpen: () => void;
  onEdit: (user: UserItem) => void;
  onToggle: (user: UserItem) => void;
}) {
  const ToggleIcon = open ? ChevronDown : ChevronRight;
  return (
    <>
      <tr className="bg-[#F8FAFB]">
        <td colSpan={6} className="p-0">
          <button type="button" onClick={onToggleOpen} className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <ToggleIcon className="h-4 w-4 text-muted" />
              {label}
            </span>
            <span className="rounded-md bg-white px-2 py-1 text-xs text-muted">{users.length} 人</span>
          </button>
        </td>
      </tr>
      {open ? (
        <tr className="bg-white text-xs text-muted">
          <Th>姓名</Th>
          <Th>邮箱/手机</Th>
          <Th>角色</Th>
          <Th>校区</Th>
          <Th>状态</Th>
          <Th>操作</Th>
        </tr>
      ) : null}
      {open ? users.map((user) => (
          <tr key={user.id} className={user.status === "ACTIVE" ? "hover:bg-[#FAFBFC]" : "bg-[#FAFBFC] text-muted"}>
            <Td className="font-medium">{getUserDisplayName(user)}</Td>
            <Td>{user.email || "-"}<div className="text-xs text-muted">{user.phone || "-"}</div></Td>
            <Td>{settingsLabels.role[user.role as keyof typeof settingsLabels.role] || user.role}</Td>
            <Td>{user.campus?.name || "总部"}</Td>
            <Td><StatusBadge active={user.status === "ACTIVE"} label={settingsLabels.userStatus[user.status as keyof typeof settingsLabels.userStatus]} /></Td>
            <Td><RowActions active={user.status === "ACTIVE"} onEdit={() => onEdit(user)} onToggle={() => onToggle(user)} /></Td>
          </tr>
        )) : null}
      {open && users.length === 0 ? (
        <tr>
          <td colSpan={6} className="px-4 py-3 text-sm text-muted">暂无{label}用户</td>
        </tr>
      ) : null}
    </>
  );
}

function DictionaryRows({
  label,
  items,
  open,
  onToggleOpen,
  onEdit,
  onToggle
}: {
  label: string;
  items: DictionaryItem[];
  open: boolean;
  onToggleOpen: () => void;
  onEdit: (item: DictionaryItem) => void;
  onToggle: (item: DictionaryItem) => void;
}) {
  const ToggleIcon = open ? ChevronDown : ChevronRight;
  return (
    <>
      <tr className="bg-[#F8FAFB]">
        <td colSpan={5} className="p-0">
          <button type="button" onClick={onToggleOpen} className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <ToggleIcon className="h-4 w-4 text-muted" />
              {label}
            </span>
            <span className="rounded-md bg-white px-2 py-1 text-xs text-muted">{items.length} 项</span>
          </button>
        </td>
      </tr>
      {open ? (
        <tr className="bg-white text-xs text-muted">
          <Th>名称</Th>
          <Th>值</Th>
          <Th>排序</Th>
          <Th>状态</Th>
          <Th>操作</Th>
        </tr>
      ) : null}
      {open ? items.map((item) => (
          <tr key={item.id} className={item.enabled ? "hover:bg-[#FAFBFC]" : "bg-[#FAFBFC] text-muted"}>
            <Td className="font-medium">{item.name}</Td>
            <Td>{item.value || "-"}</Td>
            <Td>{item.sortOrder}</Td>
            <Td><StatusBadge active={item.enabled} label={item.enabled ? "启用" : "停用"} /></Td>
            <Td><RowActions active={item.enabled} onEdit={() => onEdit(item)} onToggle={() => onToggle(item)} /></Td>
          </tr>
        )) : null}
      {open && items.length === 0 ? (
        <tr>
          <td colSpan={5} className="px-4 py-3 text-sm text-muted">暂无{label}字典项</td>
        </tr>
      ) : null}
    </>
  );
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
  const campusOptions = campuses
    .filter((item) => item.status === "ACTIVE" || item.id === value?.campusId)
    .map((item) => ({ value: item.id, label: item.name || "-" }));
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
        <Select label="所属校区" name="campusId" options={[{ value: "", label: "总部/不绑定校区" }, ...campusOptions]} defaultValue={value?.campusId || ""} />
        <Select label="用户状态" name="status" options={userStatusOptions} defaultValue={value?.status || "ACTIVE"} />
      </EntityForm>
    </BaseModal>
  );
}

function CampusModal({ open, value, managers, onClose, onSaved }: { open: boolean; value: CampusItem | null; managers: Option[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const managerOptions = managers.map((item) => ({ value: item.id, label: getUserDisplayName(item) }));
  if (value?.managerId && value.manager && !managerOptions.some((item) => item.value === value.managerId)) {
    managerOptions.push({ value: value.managerId, label: getUserDisplayName(value.manager) });
  }

  return (
    <BaseModal open={open} title={value ? "编辑校区" : "新建校区"} onClose={onClose}>
      <EntityForm endpoint={value ? `/api/settings/campuses/${value.id}` : "/api/settings/campuses"} method={value ? "PUT" : "POST"} onClose={onClose} onSaved={onSaved}>
        <Field label="校区名称" name="name" required defaultValue={value?.name} />
        <Field label="校区编码" name="code" required defaultValue={value?.code} />
        <Field label="城市" name="city" required defaultValue={value?.city} />
        <Select label="负责人" name="managerId" options={[{ value: "", label: "暂不指定" }, ...managerOptions]} defaultValue={value?.managerId || ""} />
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

function DictionaryModal({
  open,
  value,
  categories,
  onClose,
  onSaved
}: {
  open: boolean;
  value: DictionaryItem | null;
  categories: Array<{ value: string; label: string }>;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  return (
    <BaseModal open={open} title={value ? "编辑字典项" : "新建字典项"} onClose={onClose}>
      <EntityForm endpoint={value ? `/api/settings/dictionaries/${value.id}` : "/api/settings/dictionaries"} method={value ? "PUT" : "POST"} onClose={onClose} onSaved={onSaved}>
        <CategoryField options={categories} defaultValue={value?.category} />
        <Field label="名称" name="name" defaultValue={value?.name} />
        <Field label="值" name="value" defaultValue={value?.value} />
        <Field label="排序" name="sortOrder" type="number" defaultValue={String(value?.sortOrder ?? 0)} />
        <Select label="状态" name="enabled" options={[{ value: "true", label: "启用" }, { value: "false", label: "停用" }]} defaultValue={String(value?.enabled ?? true)} />
      </EntityForm>
    </BaseModal>
  );
}

function CategoryField({ options, defaultValue }: { options: Array<{ value: string; label: string }>; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue || "");
  const selectedOption = options.find((item) => item.value === value || item.label === value);

  return (
    <label>
      <span className="text-sm font-medium text-ink">分类</span>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_180px]">
        <input
          name="category"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="请输入分类名称"
          className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <select
          value={selectedOption?.value || ""}
          onChange={(event) => setValue(event.target.value)}
          className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          <option value="">快捷选择</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </label>
  );
}

function EntityForm({ endpoint, method, children, onClose, onSaved }: { endpoint: string; method: "POST" | "PUT"; children: React.ReactNode; onClose: () => void; onSaved: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData) {
    if (endpoint.includes("/api/settings/dictionaries")) {
      if (!String(formData.get("category") || "").trim()) {
        alert("请输入字典分类");
        return;
      }
      if (!String(formData.get("name") || "").trim()) {
        alert("请输入字典名称");
        return;
      }
    }

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
