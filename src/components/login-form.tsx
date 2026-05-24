"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-line bg-white p-7 shadow-soft">
      <h2 className="text-2xl font-semibold text-ink">登录后台</h2>
      <p className="mt-2 text-sm text-muted">使用数据库中的员工手机号或完整身份证号登录。</p>

      <label className="mt-7 block text-sm font-medium text-ink" htmlFor="identifier">
        手机号 / 身份证号
      </label>
      <input
        id="identifier"
        name="identifier"
        type="text"
        autoComplete="username"
        placeholder="请输入手机号或身份证号"
        className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />

      <label className="mt-5 block text-sm font-medium text-ink" htmlFor="password">
        密码
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />

      {state.error ? (
        <div className="mt-4 rounded-md border border-coral/25 bg-coral/10 px-3 py-2 text-sm text-coral">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" />
        {pending ? "登录中" : "登录"}
      </button>
    </form>
  );
}
