import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { logoutAdmin } from "@/lib/admin-auth-actions";

// كل صفحات لوحة الإدارة لازم تكون ديناميكية دايمًا — تعرض بيانات حيّة
// من SQLite (عمليات تحليل جديدة، رسائل جديدة) ما بينفع تنكاش وقت البناء.
export const dynamic = "force-dynamic";

const TABS = [
  { href: "/admin/medications", label: "قاعدة الأدوية" },
  { href: "/admin/logs", label: "سجل العمليات" },
  { href: "/admin/messages", label: "الرسائل" },
  { href: "/admin/testimonials", label: "آراء المجرّبين" },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [medicationCount, logCount, unreadCount, pendingTestimonialCount] = await Promise.all([
    prisma.medication.count(),
    prisma.operationLog.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.testimonial.count({ where: { isApproved: false } }),
  ]);
  const counts: Record<string, number> = {
    "/admin/medications": medicationCount,
    "/admin/logs": logCount,
    "/admin/messages": unreadCount,
    "/admin/testimonials": pendingTestimonialCount,
  };

  return (
    <div dir="rtl" className="grid min-h-screen grid-cols-1 sm:grid-cols-[230px_minmax(0,1fr)]" style={{ background: "#F1F2EF" }}>
      <aside className="flex flex-col gap-6 border-l border-sand/50 bg-paper p-4 sm:p-5.5">
        <div className="flex items-center justify-between gap-3">
          <Image
            src="/logo%20RxChef.jpg"
            alt="RxChef"
            width={110}
            height={32}
            className="h-8 w-auto mix-blend-multiply"
          />
          <form action={logoutAdmin}>
            <button
              type="submit"
              title="تسجيل الخروج"
              className="flex h-8.5 w-8.5 flex-none cursor-pointer items-center justify-center rounded-[10px] text-sand transition-colors hover:bg-rust/10 hover:text-rust"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="sr-only">تسجيل الخروج</span>
            </button>
          </form>
        </div>
        <nav className="grid gap-1">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center justify-between gap-2.5 rounded-[10px] px-3.25 py-2.75 text-[14.5px] text-ink/78 hover:bg-cream"
            >
              <span>{t.label}</span>
              <span className="font-latin text-[12.5px] text-sand">{counts[t.href]}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Link href="/" className="text-[13.5px] text-sand">
            الموقع العام ←
          </Link>
        </div>
      </aside>

      <main className="min-w-0 px-5 py-6.5 pb-15 sm:px-9.5">{children}</main>
    </div>
  );
}
