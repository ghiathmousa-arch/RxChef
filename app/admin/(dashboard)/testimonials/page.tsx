import { prisma } from "@/lib/prisma";
import { toggleTestimonialApproval, deleteTestimonial } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-5">
        <p className="text-xl font-semibold text-forest">آراء المجرّبين</p>
        <p className="mt-1.75 text-[13.5px] text-sand">راجع التجارب المُرسلة قبل ما تظهر بالموقع العام.</p>
      </div>

      <div className="grid gap-2.5">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border bg-paper px-5 py-4.5"
            style={{ borderColor: t.isApproved ? "rgba(52,143,128,.35)" : "rgba(175,184,181,.5)" }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[15px] font-medium text-forest">{t.name}</span>
              <span className="text-[13px] text-sand">{t.role}</span>
              <span dir="ltr" className="mr-auto font-latin text-[13px] text-sand">
                {t.createdAt.toLocaleString("ar-SY", { dateStyle: "medium", timeStyle: "short" })}
              </span>
              <form action={toggleTestimonialApproval}>
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="nextIsApproved" value={(!t.isApproved).toString()} />
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg px-2.5 py-1 text-[12.5px] whitespace-nowrap"
                  style={{
                    color: t.isApproved ? "#348F80" : "#AFB8B5",
                    background: t.isApproved ? "rgba(52,143,128,.10)" : "rgba(175,184,181,.16)",
                  }}
                >
                  {t.isApproved ? "منشورة" : "بانتظار الموافقة"}
                </button>
              </form>
              <form action={deleteTestimonial}>
                <input type="hidden" name="id" value={t.id} />
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg px-2.5 py-1 text-[12.5px] whitespace-nowrap text-rust hover:bg-rust/10"
                >
                  حذف
                </button>
              </form>
            </div>
            <p className="mt-3 text-[14.5px] leading-[1.85] text-ink/78">{t.quote}</p>
          </div>
        ))}
        {testimonials.length === 0 && <p className="text-[14px] text-sand">لا تجارب مُرسلة بعد.</p>}
      </div>
    </div>
  );
}
