import { prisma } from "@/lib/prisma";
import { Eyebrow } from "../../components/ui";

export async function StatsView() {
  const [operationCount, aggregates] = await Promise.all([
    prisma.operationLog.count(),
    prisma.operationLog.aggregate({
      _sum: { interactionsFound: true, alternativesFound: true, unmatchedCount: true },
    }),
  ]);

  const STATS = [
    { value: operationCount, label: "عملية تحليل حقيقية تمّت" },
    { value: aggregates._sum.interactionsFound ?? 0, label: "تفاعل اكتُشف فعليًا بوصفات حقيقية" },
    { value: aggregates._sum.alternativesFound ?? 0, label: "بديل اقتُرح فعليًا للمستخدمين" },
    { value: aggregates._sum.unmatchedCount ?? 0, label: "مدخل لم نتعرّف عليه — ووسّع قاعدتنا" },
  ];

  return (
    <section id="stats" className="scroll-mt-28 mx-auto max-w-[1040px]">
      <section className="pt-10 pb-7 sm:pt-20 sm:pb-11">
        <Eyebrow>إحصائيات حية</Eyebrow>
        <h1 className="max-w-[26ch] text-[clamp(30px,3.6vw,44px)] leading-[1.32] font-semibold tracking-[-0.01em] text-forest text-pretty">
          أرقام من الاستخدام الفعلي، لا من عرض تجريبي
        </h1>
        <p className="mt-5 max-w-[54ch] text-[16.5px] leading-[1.9] text-ink/76">
          كل رقم هون مسحوب مباشرة من سجل العمليات الحقيقي وقت تحميل الصفحة — بيتغيّر مع كل تحليل جديد.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-sand/40 bg-cream px-4.5 py-5 sm:px-5 sm:py-6">
            <p className="font-latin text-[28px] leading-none font-semibold tabular-nums text-forest sm:text-[32px]">
              {s.value.toLocaleString("en-US")}
            </p>
            <p className="mt-2.5 text-[13px] leading-[1.6] text-ink/64">{s.label}</p>
          </div>
        ))}
      </section>

      {operationCount === 0 && (
        <p className="mt-5 text-[14px] leading-[1.8] text-sand">
          المشروع لسا بأول استخدامه — الأرقام صفر لأنه ما تم أي تحليل حقيقي بعد، مش لأن العرض فاضي.
        </p>
      )}
    </section>
  );
}
