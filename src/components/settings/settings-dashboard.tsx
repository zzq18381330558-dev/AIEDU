"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, ChevronDown, ChevronRight, LibraryBig, Minus, Pencil, Plus, RefreshCw, UserCog, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  campusBusinessTypeOptions,
  campusStatusOptions,
  dictionaryCategoryOptions,
  settingsLabels,
  settingsRoleOptions,
  userStatusOptions
} from "@/lib/settings";
import { permissionModules } from "@/lib/permission-modules";
import { modulePermissions, roleHome } from "@/lib/roles";
import { getUserDisplayName } from "@/lib/user-display";

type Option = { id: string; name?: string | null; phone?: string | null; role?: string | null };

type UserItem = {
  id: string;
  name: string;
  phone?: string | null;
  hasIdNumber?: boolean;
  maskedIdNumber?: string | null;
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
  assistants?: Array<{ user: Option }>;
  contactPhone?: string | null;
  address?: string | null;
  status: string;
  businessType: string;
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

const preferredDictionaryCategories = [
  { value: "LEAD_SOURCE", label: "线索来源" },
  { value: "EXAM_TRACK", label: "教资方向" },
  { value: "CLASS_TYPE", label: "课程类型" },
  { value: "QUESTION_TYPE", label: "题目类型" },
  { value: "DIFFICULTY", label: "难度等级" },
  { value: "SCHOOL", label: "院校名称" },
  { value: "MAJOR", label: "专业名称" }
];

const dictionaryCategoryDisplayNames: Record<string, string> = {
  LEAD_SOURCE: "线索来源",
  EXAM_TRACK: "教资方向",
  CLASS_TYPE: "课程类型",
  QUESTION_TYPE: "题目类型",
  DIFFICULTY: "难度等级",
  SCHOOL: "院校名称",
  MAJOR: "专业名称",
  题型: "题目类型",
  难度: "难度等级",
  班型: "课程类型",
  学校: "院校名称",
  专业: "专业名称"
};

export function SettingsDashboard({
  initialUsers,
  initialCampuses,
  initialDictionaries,
  managers,
  assistantUsers,
  currentUserRole
}: {
  initialUsers: UserItem[];
  initialCampuses: CampusItem[];
  initialDictionaries: DictionaryItem[];
  managers: Option[];
  assistantUsers: Option[];
  currentUserRole: string;
}) {
  const isAdmin = currentUserRole === "ADMIN";
  const [users, setUsers] = useState(initialUsers);
  const [campuses, setCampuses] = useState(initialCampuses);
  const [dictionaries, setDictionaries] = useState(initialDictionaries);
  const [userModal, setUserModal] = useState<UserItem | "new" | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserItem | null>(null);
  const [newUserRole, setNewUserRole] = useState("");
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleInfo, setRoleInfo] = useState<string | null>(null);
  const [permissionModal, setPermissionModal] = useState<
    | { type: "role"; id: string; title: string }
    | { type: "user"; id: string; title: string }
    | null
  >(null);
  const [campusModal, setCampusModal] = useState<CampusItem | "new" | null>(null);
  const [dictionaryModal, setDictionaryModal] = useState<DictionaryItem | "new" | null>(null);
  const [openUserGroups, setOpenUserGroups] = useState<Record<string, boolean>>({});
  const [openDictionaryGroups, setOpenDictionaryGroups] = useState<Record<string, boolean>>({});

  const dictionaryCategoryChoices = useMemo(() => {
    const options = new Map<string, string>();
    for (const item of preferredDictionaryCategories) options.set(item.value, item.label);
    for (const item of dictionaryCategoryOptions) {
      if (!options.has(item.value)) options.set(item.value, getDictionaryCategoryLabel(item.value));
    }
    for (const item of dictionaries) options.set(item.category, getDictionaryCategoryLabel(item.category));
    return Array.from(options, ([value, label]) => ({ value, label }));
  }, [dictionaries]);
  const dictionaryGroups = useMemo(() => {
    const groups = new Map<string, DictionaryItem[]>();
    for (const item of dictionaries) {
      const current = groups.get(item.category) || [];
      current.push(item);
      groups.set(item.category, current);
    }
    return Array.from(groups, ([categoryName, items]) => ({
      category: categoryName,
      label: getDictionaryCategoryLabel(categoryName),
      items
    })).sort((a, b) => a.label.localeCompare(b.label, "zh-CN"));
  }, [dictionaries]);
  const userRoleGroups = useMemo(
    () =>
      (["ADMIN", "CAMPUS_MANAGER", "ADMISSIONS_COUNSELOR", "ACADEMIC_TEACHER", "LECTURER"] as const).map(
        (role) => ({
          role,
          label: settingsLabels.role[role],
          users: users.filter((item) => item.role === role)
        })
      ).filter((group) => isAdmin || group.role !== "ADMIN"),
    [isAdmin, users]
  );

  async function reload() {
    const requests = [
      fetch("/api/settings/users"),
      fetch("/api/settings/campuses")
    ];
    const [userResponse, campusResponse, dictionaryResponse] = await Promise.all(
      isAdmin ? [...requests, fetch("/api/settings/dictionaries")] : requests
    );
    const [userData, campusData, dictionaryData] = await Promise.all([
      userResponse.json(),
      campusResponse.json(),
      dictionaryResponse?.json() || Promise.resolve({})
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
      assistantIds: campus.assistants?.map((item) => item.user.id) || [],
      contactPhone: campus.contactPhone || "",
      address: campus.address || "",
      businessType: campus.businessType || "DIRECT",
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

  function openNewUser(role = "") {
    setNewUserRole(role);
    setUserModal("new");
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

      <section className={`grid gap-4 ${isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        <Metric label="用户" value={String(users.length)} hint={`${users.filter((item) => item.status === "ACTIVE").length} 个启用账号`} />
        <Metric label="校区" value={String(campuses.length)} hint={`${campuses.filter((item) => item.status === "ACTIVE").length} 个启用校区`} />
        {isAdmin ? <Metric label="字典项" value={String(dictionaries.length)} hint={`${dictionaries.filter((item) => item.enabled).length} 个启用项`} /> : null}
      </section>

      <section>
        <div className="rounded-lg border border-line bg-white">
          <PanelHeader
            icon={UserCog}
            title="用户管理"
            action={isAdmin ? "新建角色" : undefined}
            onAction={isAdmin ? () => setRoleModalOpen(true) : undefined}
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <tbody className="divide-y divide-line">
                {userRoleGroups.map((group) => (
                  <RoleUserRows
                    key={group.role}
                    role={group.role}
                    label={group.label}
                    users={group.users}
                    open={Boolean(openUserGroups[group.role])}
                    onToggleOpen={() => toggleUserGroup(group.role)}
                    onAddUser={() => openNewUser(group.role)}
                    onManagePermissions={isAdmin ? () => setPermissionModal({ type: "role", id: group.role, title: `${group.label}权限管理` }) : undefined}
                    onShowRoleInfo={() => setRoleInfo(group.role)}
                    onEdit={setUserModal}
                    onToggle={toggleUser}
                    onManageUserPermissions={isAdmin ? (user) => setPermissionModal({ type: "user", id: user.id, title: `${getUserDisplayName(user)}权限管理` }) : undefined}
                    onResetPassword={isAdmin ? setResetPasswordUser : undefined}
                    canDeleteRole={isAdmin}
                  />
                ))}
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">暂无用户，可从角色组点击增加用户开通账号</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white">
        <PanelHeader icon={Building2} title="校区管理" action={isAdmin ? "新建校区" : undefined} onAction={isAdmin ? () => setCampusModal("new") : undefined} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-[#F8FAFB] text-muted">
              <tr>
                <Th>校区名称</Th>
                <Th>校区类型</Th>
                <Th>校长</Th>
                <Th>校长助理</Th>
                <Th>状态</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {campuses.map((campus) => (
                <tr key={campus.id} className={campus.status === "ACTIVE" ? "hover:bg-[#FAFBFC]" : "bg-[#FAFBFC] text-muted"}>
                  <Td><span className="font-medium">{campus.name}</span><div className="text-xs text-muted">{campus.code}</div></Td>
                  <Td>{settingsLabels.campusBusinessType[campus.businessType as keyof typeof settingsLabels.campusBusinessType] || "直营"}</Td>
                  <Td>{getUserDisplayName(campus.manager)}</Td>
                  <Td>{campus.assistants?.length ? campus.assistants.map((item) => getUserDisplayName(item.user)).join("、") : "未配置"}</Td>
                  <Td><StatusBadge active={campus.status === "ACTIVE"} label={settingsLabels.campusStatus[campus.status as keyof typeof settingsLabels.campusStatus]} /></Td>
                  <Td><RowActions active={campus.status === "ACTIVE"} onEdit={() => setCampusModal(campus)} onToggle={isAdmin ? () => toggleCampus(campus) : undefined} /></Td>
                </tr>
              ))}
              {campuses.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">暂无校区，可点击新建校区完善基础信息</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {isAdmin ? <section className="rounded-lg border border-line bg-white">
        <PanelHeader
          icon={LibraryBig}
          title="业务字典"
          action="新建字典"
          onAction={() => setDictionaryModal("new")}
        />
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
      </section> : null}

      <UserModal
        open={Boolean(userModal)}
        value={userModal === "new" ? null : userModal}
        defaultRole={userModal === "new" ? newUserRole : ""}
        campuses={campuses}
        isAdmin={isAdmin}
        onClose={() => setUserModal(null)}
        onSaved={reload}
      />
      <ResetPasswordModal
        user={resetPasswordUser}
        onClose={() => setResetPasswordUser(null)}
      />
      <RolePlaceholderModal open={roleModalOpen} onClose={() => setRoleModalOpen(false)} />
      <RoleInfoModal role={roleInfo} onClose={() => setRoleInfo(null)} />
      <PermissionModal value={permissionModal} onClose={() => setPermissionModal(null)} />
      <CampusModal open={Boolean(campusModal)} value={campusModal === "new" ? null : campusModal} managers={managers} assistantUsers={assistantUsers} isAdmin={isAdmin} onClose={() => setCampusModal(null)} onSaved={reload} />
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

function PanelHeader({
  icon: Icon,
  title,
  action,
  onAction,
  secondaryAction,
  onSecondaryAction,
  tools
}: {
  icon: LucideIcon;
  title: string;
  action?: string;
  onAction?: () => void;
  secondaryAction?: string;
  onSecondaryAction?: () => void;
  tools?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
      <div className="flex items-center gap-2 font-semibold text-ink">
        <Icon className="h-4 w-4 text-brand-600" />
        {title}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {tools}
        {secondaryAction ? (
          <button onClick={onSecondaryAction} className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm text-ink">
            <Plus className="h-4 w-4" />
            {secondaryAction}
          </button>
        ) : null}
        {action ? (
          <button onClick={onAction} className="inline-flex h-9 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            {action}
          </button>
        ) : null}
      </div>
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

function RowActions({
  active,
  onEdit,
  onToggle,
  onPermission,
  onResetPassword
}: {
  active: boolean;
  onEdit: () => void;
  onToggle?: () => void;
  onPermission?: () => void;
  onResetPassword?: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <EditButton onClick={onEdit} />
      {onToggle ? <ToggleButton active={active} onClick={onToggle} /> : null}
      {onPermission ? (
        <button onClick={onPermission} className="inline-flex h-8 items-center rounded-md border border-line px-2 text-xs">
          权限管理
        </button>
      ) : null}
      {onResetPassword ? (
        <button onClick={onResetPassword} className="inline-flex h-8 items-center rounded-md border border-line px-2 text-xs">
          重置密码
        </button>
      ) : null}
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
  return dictionaryCategoryDisplayNames[categoryName] || settingsLabels.dictionaryCategory[categoryName as keyof typeof settingsLabels.dictionaryCategory] || categoryName;
}

function isFixedRole(role: string) {
  return ["ADMIN", "CAMPUS_MANAGER", "ADMISSIONS_COUNSELOR", "ACADEMIC_TEACHER", "LECTURER"].includes(role);
}

function RoleUserRows({
  role,
  label,
  users,
  open,
  onToggleOpen,
  onAddUser,
  onManagePermissions,
  onShowRoleInfo,
  onEdit,
  onToggle,
  onManageUserPermissions,
  onResetPassword,
  canDeleteRole
}: {
  role: string;
  label: string;
  users: UserItem[];
  open: boolean;
  onToggleOpen: () => void;
  onAddUser: () => void;
  onManagePermissions?: () => void;
  onShowRoleInfo: () => void;
  onEdit: (user: UserItem) => void;
  onToggle: (user: UserItem) => void;
  onManageUserPermissions?: (user: UserItem) => void;
  onResetPassword?: (user: UserItem) => void;
  canDeleteRole?: boolean;
}) {
  const ToggleIcon = open ? ChevronDown : ChevronRight;
  const deleteDisabled = !canDeleteRole || isFixedRole(role);
  return (
    <>
      <tr className="bg-[#F8FAFB]">
        <td colSpan={6} className="p-0">
          <div className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <button type="button" onClick={onToggleOpen} className="inline-flex items-center gap-2 text-left text-sm font-semibold text-ink">
                <ToggleIcon className="h-4 w-4 text-muted" />
                {label}
                <span className="rounded-md bg-white px-2 py-1 text-xs font-normal text-muted">{users.length} 人</span>
            </button>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onAddUser} className="inline-flex h-8 items-center gap-1 rounded-md border border-line bg-white px-2 text-xs text-ink">
                <Plus className="h-3.5 w-3.5" />
                增加用户
              </button>
              <span title={deleteDisabled ? "系统基础角色不可删除" : "删除角色"}>
                <button
                  type="button"
                  disabled={deleteDisabled}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-line bg-white px-2 text-xs text-muted disabled:cursor-not-allowed disabled:border-[#E5E7EB] disabled:bg-[#F8FAFB] disabled:text-[#A0A7B2]"
                >
                  <Minus className="h-3.5 w-3.5" />
                  删除角色
                </button>
              </span>
              {onManagePermissions ? (
                <button type="button" onClick={onManagePermissions} className="inline-flex h-8 items-center rounded-md border border-line bg-white px-2 text-xs text-ink">
                  权限管理
                </button>
              ) : null}
              <button type="button" onClick={onShowRoleInfo} className="inline-flex h-8 items-center rounded-md border border-line bg-white px-2 text-xs text-ink">
                角色说明
              </button>
            </div>
          </div>
        </td>
      </tr>
      {open ? (
        <tr className="bg-white text-xs text-muted">
          <Th>姓名</Th>
          <Th>手机</Th>
          <Th>角色</Th>
          <Th>校区</Th>
          <Th>状态</Th>
          <Th>操作</Th>
        </tr>
      ) : null}
      {open ? users.map((user) => (
          <tr key={user.id} className={user.status === "ACTIVE" ? "hover:bg-[#FAFBFC]" : "bg-[#FAFBFC] text-muted"}>
            <Td className="font-medium">{getUserDisplayName(user)}</Td>
            <Td>{user.phone || "-"}</Td>
            <Td>{settingsLabels.role[user.role as keyof typeof settingsLabels.role] || user.role}</Td>
            <Td>{user.campus?.name || "总部"}</Td>
            <Td><StatusBadge active={user.status === "ACTIVE"} label={settingsLabels.userStatus[user.status as keyof typeof settingsLabels.userStatus]} /></Td>
            <Td>
              <RowActions
                active={user.status === "ACTIVE"}
                onEdit={() => onEdit(user)}
                onToggle={() => onToggle(user)}
                onPermission={onManageUserPermissions ? () => onManageUserPermissions(user) : undefined}
                onResetPassword={onResetPassword ? () => onResetPassword(user) : undefined}
              />
            </Td>
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

function UserModal({
  open,
  value,
  defaultRole,
  campuses,
  isAdmin,
  onClose,
  onSaved
}: {
  open: boolean;
  value: UserItem | null;
  defaultRole?: string;
  campuses: CampusItem[];
  isAdmin: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const roleOptions: Array<{ value: string; label: string }> = settingsRoleOptions
    .filter((item) => isAdmin || item.value !== "ADMIN")
    .map((item) => ({
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
  const fixedNewRole = !value ? defaultRole || "ADMISSIONS_COUNSELOR" : "";
  const readonlyRole = value ? value.role : fixedNewRole;
  const readonlyRoleLabel = readonlyRole
    ? settingsLabels.role[readonlyRole as keyof typeof settingsLabels.role] || readonlyRole
    : "";

  return (
    <BaseModal open={open} title={value ? "编辑用户" : "新建用户"} onClose={onClose}>
      <EntityForm endpoint={value ? `/api/settings/users/${value.id}` : "/api/settings/users"} method={value ? "PUT" : "POST"} onClose={onClose} onSaved={onSaved}>
        <Field label="姓名" name="name" required defaultValue={value?.name} />
        <Field label="手机号" name="phone" defaultValue={value?.phone} />
        {value ? (
          <ReadonlyField label="身份证号" name="maskedIdNumber" value={value.maskedIdNumber || "未填写"} displayValue={value.maskedIdNumber || "未填写"} />
        ) : (
          <Field label="身份证号" name="idNumber" />
        )}
        {!value ? <Field label="初始密码" name="password" type="password" /> : null}
        {value && isAdmin ? (
          <Select label="用户角色" name="role" options={roleOptions} defaultValue={value.role || "ADMISSIONS_COUNSELOR"} />
        ) : (
          <ReadonlyField label="用户角色" name="role" value={readonlyRole} displayValue={readonlyRoleLabel} />
        )}
        <Select label="所属校区" name="campusId" options={[...(isAdmin ? [{ value: "", label: "总部/不绑定校区" }] : []), ...campusOptions]} defaultValue={value?.campusId || campusOptions[0]?.value || ""} />
        <Select label="用户状态" name="status" options={userStatusOptions} defaultValue={value?.status || "ACTIVE"} />
      </EntityForm>
    </BaseModal>
  );
}

function ResetPasswordModal({ user, onClose }: { user: UserItem | null; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const canUseIdNumberSuffix = Boolean(user?.hasIdNumber);

  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
    setSaving(false);
  }, [user?.id]);

  if (!user) return null;
  const targetUser = user;

  async function resetPassword(payload: { mode: "CUSTOM"; password: string } | { mode: "ID_NUMBER_SUFFIX" | "DEFAULT_123456" }) {
    setSaving(true);
    const response = await fetch(`/api/settings/users/${targetUser.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(data.error || "密码重置失败");
      setSaving(false);
      return;
    }
    alert(data.message || "密码已重置");
    setSaving(false);
    onClose();
  }

  async function submit() {
    if (!password) {
      alert("请输入新密码");
      return;
    }
    if (password.length < 6) {
      alert("新密码最短 6 位");
      return;
    }
    if (password !== confirmPassword) {
      alert("两次输入的密码不一致");
      return;
    }

    await resetPassword({ mode: "CUSTOM", password });
  }

  return (
    <BaseModal open={Boolean(user)} title="重置密码" onClose={onClose}>
      <div className="space-y-4 p-5">
        <div className="grid gap-3 rounded-md bg-[#F8FAFB] p-4 text-sm md:grid-cols-3">
          <InfoRow label="用户姓名" value={getUserDisplayName(user)} />
          <InfoRow label="手机号" value={user.phone || "-"} />
          <InfoRow label="身份证号" value={user.maskedIdNumber || "-"} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <PasswordInput label="新密码" value={password} onChange={setPassword} />
          <PasswordInput label="确认新密码" value={confirmPassword} onChange={setConfirmPassword} />
        </div>
        <div className="flex flex-wrap gap-2">
          <span title={canUseIdNumberSuffix ? "使用身份证号后六位" : "该用户未填写身份证号"}>
            <button
              type="button"
              disabled={!canUseIdNumberSuffix || saving}
              onClick={() => resetPassword({ mode: "ID_NUMBER_SUFFIX" })}
              className="h-9 rounded-md border border-line px-3 text-sm text-ink disabled:cursor-not-allowed disabled:bg-[#F8FAFB] disabled:text-muted"
            >
              使用身份证后六位
            </button>
          </span>
          <button
            type="button"
            disabled={saving}
            onClick={() => resetPassword({ mode: "DEFAULT_123456" })}
            className="h-9 rounded-md border border-line px-3 text-sm text-ink"
          >
            使用默认密码 123456
          </button>
          {!canUseIdNumberSuffix ? <span className="self-center text-xs text-muted">该用户未填写身份证号</span> : null}
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-10 rounded-md border border-line px-4 text-sm text-muted">取消</button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="h-10 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

function PasswordInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}

function ReadonlyField({ label, name, value, displayValue }: { label: string; name: string; value: string; displayValue: string }) {
  return (
    <label>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input type="hidden" name={name} value={value} />
      <input
        value={displayValue}
        disabled
        readOnly
        className="mt-2 h-10 w-full cursor-not-allowed rounded-md border border-line bg-[#F8FAFB] px-3 text-sm text-muted"
      />
    </label>
  );
}

function DisplayField({ label, displayValue }: { label: string; displayValue: string }) {
  return (
    <label>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        value={displayValue}
        disabled
        readOnly
        className="mt-2 h-10 w-full cursor-not-allowed rounded-md border border-line bg-[#F8FAFB] px-3 text-sm text-muted"
      />
    </label>
  );
}

function MultiSelect({
  label,
  name,
  options,
  defaultValues
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  defaultValues: string[];
}) {
  return (
    <label>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input type="hidden" name={name} value="" />
      <select
        name={name}
        multiple
        defaultValue={defaultValues}
        className="mt-2 min-h-28 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function RolePlaceholderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  function notifyUnavailable() {
    alert("自定义角色功能将在后续版本开放");
  }

  return (
    <BaseModal open={open} title="新建角色" onClose={onClose}>
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <Field label="角色名称" name="roleName" />
        <Field label="角色说明" name="roleDescription" />
        <div className="md:col-span-2">
          <div className="text-sm font-medium text-ink">权限选择</div>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {permissionModules.map((item) => (
              <label key={item.key} className="flex items-center gap-3 rounded-md border border-line bg-[#F8FAFB] px-3 py-2 text-sm text-muted">
                <input type="checkbox" disabled className="h-4 w-4" />
                {item.label}
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-md bg-[#F8FAFB] p-3 text-sm leading-6 text-muted md:col-span-2">
          当前版本使用固定基础角色；自定义角色将在后续权限模块中开放。
        </div>
        <div className="flex justify-end gap-3 md:col-span-2">
          <button type="button" onClick={onClose} className="h-10 rounded-md border border-line px-4 text-sm text-muted">取消</button>
          <button type="button" onClick={notifyUnavailable} className="h-10 rounded-md border border-line bg-[#F8FAFB] px-4 text-sm text-muted">
            保存
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

const moduleNames: Record<string, string> = {
  "/dashboard": "工作台",
  "/crm": "招生中心",
  "/student-service": "学员中心",
  "/question-bank": "题库中心",
  "/content": "教研中心",
  "/analytics": "数据中心",
  "/sop": "运营 SOP",
  "/settings": "系统设置"
};

const roleInfoCopy: Record<string, { positioning: string; dataScope: string; scenario: string }> = {
  ADMIN: {
    positioning: "系统最高管理角色",
    dataScope: "全部校区、全部数据",
    scenario: "系统初始化、用户/校区/字典维护、全局管理"
  },
  CAMPUS_MANAGER: {
    positioning: "校区经营校长",
    dataScope: "以当前系统实现为准",
    scenario: "校区日常运营管理"
  },
  ADMISSIONS_COUNSELOR: {
    positioning: "线索跟进与转化人员",
    dataScope: "以当前系统实现为准",
    scenario: "录入线索、跟进线索、转化学员"
  },
  ACADEMIC_TEACHER: {
    positioning: "学员服务与教学运营人员",
    dataScope: "以当前系统实现为准",
    scenario: "学员服务、排课、打卡、学习计划、教研辅助"
  },
  LECTURER: {
    positioning: "授课与教研资料使用人员",
    dataScope: "以当前系统实现为准",
    scenario: "查看题库、使用教研内容、参与授课相关工作"
  }
};

function getRoleModules(role: string) {
  return Object.entries(modulePermissions)
    .filter(([, roles]) => roles.some((item) => item === role))
    .map(([path]) => moduleNames[path] || path);
}

function RoleInfoModal({ role, onClose }: { role: string | null; onClose: () => void }) {
  if (!role) return null;
  const label = settingsLabels.role[role as keyof typeof settingsLabels.role] || role;
  const info = roleInfoCopy[role] || {
    positioning: "自定义角色",
    dataScope: "以当前系统实现为准",
    scenario: "后续权限模块开放后配置"
  };
  const modules = getRoleModules(role);

  return (
    <BaseModal open={Boolean(role)} title="角色说明" onClose={onClose}>
      <div className="space-y-4 p-5">
        <InfoRow label="角色名称" value={label} />
        <InfoRow label="角色定位" value={info.positioning} />
        <InfoRow label="可访问模块" value={modules.length ? modules.join("、") : "暂无配置"} />
        <InfoRow label="默认入口" value={moduleNames[roleHome[role as keyof typeof roleHome]] || roleHome[role as keyof typeof roleHome] || "-"} />
        <InfoRow label="数据范围" value={info.dataScope} />
        <InfoRow label="典型使用场景" value={info.scenario} />
      </div>
    </BaseModal>
  );
}

function PermissionModal({
  value,
  onClose
}: {
  value: { type: "role"; id: string; title: string } | { type: "user"; id: string; title: string } | null;
  onClose: () => void;
}) {
  const [modules, setModules] = useState<string[]>([]);
  const [configured, setConfigured] = useState(false);
  const [source, setSource] = useState<"admin" | "user" | "role" | "default">("default");
  const [userConfigured, setUserConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const endpoint = value ? `/api/settings/permissions/${value.type === "role" ? "roles" : "users"}/${value.id}` : "";
  const modalType = value?.type;

  useEffect(() => {
    if (!endpoint) return;
    let active = true;
    async function loadPermissions() {
      setLoading(true);
      const response = await fetch(endpoint);
      const data = await response.json().catch(() => ({}));
      if (!active) return;
      if (!response.ok) {
        alert(data.error || "权限加载失败");
        setLoading(false);
        return;
      }
      setModules(data.modules || []);
      setConfigured(Boolean(data.configured));
      setSource(data.source || (modalType === "role" ? "role" : data.configured ? "user" : "role"));
      setUserConfigured(Boolean(data.userConfigured ?? data.configured));
      setLoading(false);
    }
    loadPermissions();
    return () => {
      active = false;
    };
  }, [endpoint, modalType]);

  async function savePermissions() {
    if (!endpoint) return;
    setSaving(true);
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modules })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(data.error || "权限保存失败");
      setSaving(false);
      return;
    }
    setSaving(false);
    onClose();
  }

  async function clearUserPermissions() {
    if (!endpoint || value?.type !== "user") return;
    if (!window.confirm("确定清除该用户的个人权限，并恢复使用角色权限吗？")) return;
    setSaving(true);
    const response = await fetch(endpoint, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(data.error || "清除个人权限失败");
      setSaving(false);
      return;
    }
    setModules(data.modules || []);
    setConfigured(false);
    setSource(data.source || "role");
    setUserConfigured(false);
    setSaving(false);
    alert(data.message || "已恢复使用角色权限");
  }

  function toggleModule(module: string) {
    setModules((current) =>
      current.includes(module) ? current.filter((item) => item !== module) : [...current, module]
    );
  }

  if (!value) return null;
  const sourceLabel = source === "user" ? "个人权限" : source === "admin" ? "管理员全部权限" : source === "default" ? "角色权限（默认）" : "角色权限";

  return (
    <BaseModal open={Boolean(value)} title={value.title} onClose={onClose}>
      <div className="space-y-4 p-5">
        <div className="rounded-md bg-[#F8FAFB] p-3 text-sm leading-6 text-muted">
          <div>当前生效来源：{sourceLabel}</div>
          <div>
            {value.type === "user"
              ? "用户个人权限和角色权限都存在时，最新一次权限设置生效。保存后，个人权限将作为最新设置生效。"
              : "修改角色权限后，将覆盖早于本次修改的个人权限。"}
          </div>
          {value.type === "user" && userConfigured ? <div className="font-medium text-amber-700">该用户已配置个人权限；若个人权限更新时间晚于角色权限，将按个人权限生效。</div> : null}
          {!configured ? " 当前展示为默认/继承权限。" : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {permissionModules.map((item) => (
            <label key={item.key} className="flex items-center gap-3 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={modules.includes(item.key)}
                onChange={() => toggleModule(item.key)}
                disabled={loading || saving}
                className="h-4 w-4"
              />
              {item.label}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          {value.type === "user" && userConfigured ? (
            <button type="button" onClick={clearUserPermissions} disabled={loading || saving} className="h-10 rounded-md border border-line px-4 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-60">
              清除个人权限，恢复使用角色权限
            </button>
          ) : null}
          <button type="button" onClick={onClose} className="h-10 rounded-md border border-line px-4 text-sm text-muted">取消</button>
          <button type="button" onClick={savePermissions} disabled={loading || saving} className="h-10 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? "保存中..." : "保存权限"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#F8FAFB] p-3">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="mt-1 text-sm leading-6 text-ink">{value}</div>
    </div>
  );
}

function CampusModal({
  open,
  value,
  managers,
  assistantUsers,
  isAdmin,
  onClose,
  onSaved
}: {
  open: boolean;
  value: CampusItem | null;
  managers: Option[];
  assistantUsers: Option[];
  isAdmin: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const managerOptions = managers.map((item) => ({ value: item.id, label: getUserDisplayName(item) }));
  const selectedAssistantIds = value?.assistants?.map((item) => item.user.id) || [];
  if (value?.managerId && value.manager && !managerOptions.some((item) => item.value === value.managerId)) {
    managerOptions.push({ value: value.managerId, label: getUserDisplayName(value.manager) });
  }

  return (
    <BaseModal open={open} title={value ? "编辑校区" : "新建校区"} onClose={onClose}>
      <EntityForm endpoint={value ? `/api/settings/campuses/${value.id}` : "/api/settings/campuses"} method={value ? "PUT" : "POST"} onClose={onClose} onSaved={onSaved}>
        <Field label="校区名称" name="name" required defaultValue={value?.name} />
        <Field label="校区编码" name="code" required defaultValue={value?.code} />
        <Field label="城市" name="city" required defaultValue={value?.city} />
        {isAdmin ? (
          <Select label="校长" name="managerId" options={[{ value: "", label: "暂不指定" }, ...managerOptions]} defaultValue={value?.managerId || ""} />
        ) : (
          <ReadonlyField label="校长" name="managerId" value={value?.managerId || ""} displayValue={getUserDisplayName(value?.manager, "暂不指定")} />
        )}
        {isAdmin ? (
          <MultiSelect
            label="校长助理"
            name="assistantIds"
            options={assistantUsers.map((item) => ({
              value: item.id,
              label: `${getUserDisplayName(item)} · ${settingsLabels.role[item.role as keyof typeof settingsLabels.role] || item.role || "-"}${item.phone ? ` · ${item.phone}` : ""}`
            }))}
            defaultValues={selectedAssistantIds}
          />
        ) : (
          <DisplayField
            label="校长助理"
            displayValue={value?.assistants?.length ? value.assistants.map((item) => getUserDisplayName(item.user)).join("、") : "未配置"}
          />
        )}
        <Select label="校区类型" name="businessType" options={campusBusinessTypeOptions} defaultValue={value?.businessType || "DIRECT"} />
        <Field label="联系方式" name="contactPhone" defaultValue={value?.contactPhone} />
        {isAdmin ? (
          <Select label="校区状态" name="status" options={campusStatusOptions} defaultValue={value?.status || "ACTIVE"} />
        ) : (
          <ReadonlyField label="校区状态" name="status" value={value?.status || "ACTIVE"} displayValue={settingsLabels.campusStatus[value?.status as keyof typeof settingsLabels.campusStatus] || "启用"} />
        )}
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
    const payload: Record<string, FormDataEntryValue | FormDataEntryValue[]> = Object.fromEntries(formData.entries());
    if (endpoint.includes("/api/settings/campuses") && formData.has("assistantIds")) {
      payload.assistantIds = formData.getAll("assistantIds");
    }
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
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
