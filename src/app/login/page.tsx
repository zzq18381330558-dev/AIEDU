import { redirect } from "next/navigation";
import { getFirstAllowedPath } from "@/lib/permissions";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(await getFirstAllowedPath(user));

  return (
    <main className="flex min-h-screen bg-[#F5F7F8]">
      <section className="hidden flex-1 bg-ink px-16 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-100">AI EDU ADMIN</div>
          <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight">
            教师资格证培训业务的一体化运营中枢
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
            从招生线索、学员服务、题库中心、教研中心到运营SOP，先把核心流程管理起来。
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm text-slate-300">
          <div className="border-t border-white/20 pt-4">招生转化</div>
          <div className="border-t border-white/20 pt-4">AI 服务</div>
          <div className="border-t border-white/20 pt-4">校区复制</div>
        </div>
      </section>
      <section className="flex w-full items-center justify-center px-6 lg:w-[520px]">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="text-sm font-semibold text-brand-600">AI EDU ADMIN</div>
            <h1 className="mt-3 text-3xl font-semibold text-ink">业务管理系统</h1>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
