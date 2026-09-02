"use client";

import { useActionState } from "react";
import Image from "next/image";
import { loginAdmin } from "@/lib/admin-auth-actions";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(loginAdmin, undefined);

  return (
    <div
      dir="rtl"
      className="flex min-h-screen items-center justify-center px-5 py-10"
      style={{ background: "linear-gradient(170deg,#F1F2EF,#EDEFEB)" }}
    >
      <div className="w-full max-w-[390px]">
        <div className="mb-5.5 flex items-center justify-between gap-4">
          <Image
            src="/logo%20RxChef.jpg"
            alt="RxChef"
            width={120}
            height={34}
            className="h-8.5 w-auto mix-blend-multiply"
            priority
          />
          <span className="text-[12.5px] tracking-[0.08em] text-sand">لوحة الإدارة</span>
        </div>

        <div className="rounded-2xl border border-sand/50 bg-paper p-6.5">
          <p className="mb-1 text-[17px] font-semibold text-forest">تسجيل الدخول</p>
          <p className="mb-5.5 text-[13.5px] leading-[1.7] text-sand">حساب واحد ثابت لإدارة قاعدة الأدوية والسجلات.</p>

          <form action={action} className="grid gap-3.5">
            <label className="block">
              <span className="mb-1.75 block text-[13.5px] text-forest">اسم المستخدم</span>
              <input
                name="username"
                dir="ltr"
                autoComplete="username"
                placeholder="admin"
                required
                className="w-full rounded-[10px] border border-sand/55 bg-cream px-3.25 py-3 text-right font-latin text-[15px] text-ink outline-none focus:border-teal/55"
              />
            </label>
            <label className="block">
              <span className="mb-1.75 block text-[13.5px] text-forest">كلمة المرور</span>
              <input
                name="password"
                type="password"
                dir="ltr"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className="w-full rounded-[10px] border border-sand/55 bg-cream px-3.25 py-3 text-right font-latin text-[15px] text-ink outline-none focus:border-teal/55"
              />
            </label>
            {state?.error && <p className="text-[13px] text-rust">{state.error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="mt-1 rounded-[11px] bg-teal px-5 py-3.25 text-[15.5px] font-medium text-cream transition-colors hover:bg-teal-dark disabled:opacity-60"
            >
              {pending ? "جارٍ الدخول..." : "دخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
