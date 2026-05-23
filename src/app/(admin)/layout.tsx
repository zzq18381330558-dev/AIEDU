import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { Topbar } from "@/components/topbar";
import { getEffectivePermissions } from "@/lib/permissions";
import { requireUser } from "@/lib/session";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const allowedModules = await getEffectivePermissions(user);

  return (
    <div className="flex min-h-screen bg-[#F5F7F8]">
      <AppSidebar role={user.role} allowedModules={allowedModules} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <MobileNav role={user.role} allowedModules={allowedModules} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
