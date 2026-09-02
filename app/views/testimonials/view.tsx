import { prisma } from "@/lib/prisma";
import { Eyebrow } from "../../components/ui";
import { TestimonialForm } from "./form";

export async function TestimonialsView() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <section id="testimonials" className="scroll-mt-28 mx-auto max-w-[1040px]">
      <section className="pt-10 pb-7 sm:pt-20 sm:pb-11">
        <Eyebrow>آراء مجرّبين</Eyebrow>
        <h1 className="max-w-[24ch] text-[clamp(30px,3.6vw,44px)] leading-[1.32] font-semibold tracking-[-0.01em] text-forest text-pretty">
          تجارب حقيقية من أطباء وصيادلة جرّبوا الأداة
        </h1>
        <p className="mt-5 max-w-[54ch] text-[16.5px] leading-[1.9] text-ink/76">
          كل تجربة هون مرسلة من شخص فعلي وتمّت مراجعتها قبل النشر — ما في تجربة مصطنعة أو مكتوبة بالنيابة عن حدا.
        </p>
      </section>

      {testimonials.length > 0 ? (
        <section className="grid gap-3.5 sm:grid-cols-2">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="rounded-[22px] border border-sand/40 bg-paper p-6 shadow-[0_20px_46px_-38px_rgba(9,72,61,0.32)]"
            >
              <p className="text-[15.5px] leading-[1.9] text-ink/82 text-pretty">&quot;{t.quote}&quot;</p>
              <p className="mt-4 text-[14px] font-medium text-forest">
                {t.name} <span className="font-normal text-sand">· {t.role}</span>
              </p>
            </div>
          ))}
        </section>
      ) : (
        <section className="rounded-[22px] border border-dashed border-sand/50 bg-cream/60 p-8 text-center sm:p-11">
          <p className="text-[17px] font-medium text-forest">لسا ما في تجارب موثّقة</p>
          <p className="mx-auto mt-2.5 max-w-[46ch] text-[15px] leading-[1.85] text-ink/68">
            المشروع لسا حديث. لما يجرّبه أطباء أو صيادلة فعليًا ويوافقوا ينشروا رأيهم، رح تظهر تجاربهم هون بدل هالمكان.
          </p>
        </section>
      )}

      <section className="mt-9 sm:mt-14">
        <p className="mb-4 text-[15px] font-semibold text-forest">جرّبت الأداة؟ شاركنا رأيك</p>
        <TestimonialForm />
      </section>
    </section>
  );
}
