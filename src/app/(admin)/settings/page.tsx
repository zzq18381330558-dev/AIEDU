import { Settings } from "lucide-react";
import { ModulePage } from "@/components/module-page";
import { requireUser } from "@/lib/session";

export default async function SettingsPage() {
  await requireUser("/settings");

  return (
    <ModulePage
      title="系统设置"
      description="管理组织、校区、账号、角色权限和基础字典。当前仅管理员可见。"
      icon={Settings}
      metrics={[
        { label: "组织", value: "1", hint: "默认总部组织" },
        { label: "角色", value: "6", hint: "已配置基础角色" },
        { label: "权限模块", value: "8", hint: "按角色控制导航" }
      ]}
      actions={["用户与角色管理", "校区管理", "业务字典", "AI 配置与审计日志"]}
    />
  );
}
