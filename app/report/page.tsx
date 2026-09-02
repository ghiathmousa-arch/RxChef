"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { Badge, Eyebrow } from "../components/ui";
import { severityLabel, severityTone } from "@/lib/severity";
import { useAnalysis } from "../context/analysis-context";

function Section({
  num,
  title,
  meta,
  open,
  onToggle,
  children,
}: {
  num: string;
  title: string;
  meta: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-sand/40 bg-paper shadow-[0_20px_46px_-34px_rgba(9,72,61,0.34)]">
      <div role="button" onClick={onToggle} className="flex cursor-pointer items-center gap-4 px-6 py-5.5">
        <span className="w-5.5 font-latin text-[13px] text-sand">{num}</span>
        <span className="flex-1 text-lg font-semibold text-forest">{title}</span>
        <span className="text-[13.5px] text-sand">{meta}</span>
        <span className="w-4.5 text-center font-latin text-[19px] text-teal">{open ? "−" : "+"}</span>
      </div>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

export default function ReportPage() {
  const { result, setResult } = useAnalysis();
  const [open, setOpen] = useState([true, true, true]);

  function toggle(i: number) {
    setOpen((o) => o.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <div className="box-border min-h-screen px-5 pt-24 pb-24 sm:px-8 sm:pt-28 lg:px-10 xl:px-14">
      <SiteHeader />

      <main className="mx-auto max-w-[1040px]">
        {!result ? (
          <section className="pt-10 pb-16 text-center sm:pt-20 sm:pb-24">
            <Eyebrow>تقرير التحليل</Eyebrow>
            <h1 className="mx-auto max-w-[26ch] text-[clamp(26px,3.2vw,38px)] leading-[1.32] font-semibold text-forest text-pretty">
              لسا ما في تحليل تُعرض نتيجته
            </h1>
            <p className="mx-auto mt-4 max-w-[46ch] text-[15.5px] leading-[1.9] text-ink/70">
              حلّل وصفة من الأداة الأول، وبعد ما تخلص رح توديك هالصفحة لتقرير التحليل الكامل تلقائيًا.
            </p>
            <Link
              href="/#tool"
              className="mt-7 inline-flex items-center gap-3 rounded-2xl bg-teal px-8 py-3.5 text-[15.5px] font-medium text-cream transition-colors hover:bg-teal-dark"
            >
              روح للأداة ←
            </Link>
          </section>
        ) : (
          <>
            <section className="pt-10 pb-7 sm:pt-20 sm:pb-11">
              <Eyebrow>تقرير التحليل</Eyebrow>
              <h1 className="max-w-[26ch] text-[clamp(30px,3.6vw,46px)] leading-[1.3] font-semibold tracking-[-0.01em] text-forest text-pretty">
                خطوات العمل الكاملة على هذه التركيبة
              </h1>
              <p className="mt-5 max-w-[52ch] text-[16.5px] leading-[1.9] text-ink/76">
                ثلاث مراحل، كل واحدة موسّعة بما رآه النظام حرفيًا: المدخل، ما طابقه، ودرجة الثقة. لا شيء مخفي.
              </p>
              <p className="mt-4.5 text-sm text-sand">
                عملية <span className="font-latin text-forest">#{result.operationId}</span> · {result.summary.total_input} مكوّنات
              </p>
            </section>

            <section className="grid gap-3.5">
              <Section
                num="01"
                title="قراءة الوصفة ومطابقة الأسماء"
                meta={`${result.summary.total_input} مدخلات · ${result.summary.matched_count} مطابقة`}
                open={open[0]}
                onToggle={() => toggle(0)}
              >
                <div className="grid gap-2.5">
                  {result.matched.map((m) => (
                    <div
                      key={m.medication_id}
                      className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3.5 rounded-2xl bg-cream px-4 py-3.5"
                    >
                      <span dir="ltr" className="text-right font-latin text-[14.5px] text-ink/62">
                        {m.query}
                      </span>
                      <span className="font-latin text-sand">←</span>
                      <span dir="ltr" className="font-latin text-[15px] text-forest">
                        {m.medication_name}
                      </span>
                      <Badge tone={m.score >= 90 ? "ok" : "warn"}>{Math.round(m.score)}%</Badge>
                    </div>
                  ))}
                  {result.unmatched.map((u, i) => (
                    <div
                      key={`unmatched-${i}`}
                      className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3.5 rounded-2xl bg-cream px-4 py-3.5"
                    >
                      <span dir="ltr" className="text-right font-latin text-[14.5px] text-ink/62">
                        {u.query}
                      </span>
                      <span className="font-latin text-sand">←</span>
                      <span dir="ltr" className="text-right font-latin text-[15px] text-rust">
                        {u.closest_guess ?? "غير موجود بقاعدة بياناتنا"}
                      </span>
                      <Badge tone="bad">{Math.round(u.score)}%</Badge>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-[1.85] text-ink/68">
                  المطابقة تعتمد على تشابه الحروف (rapidfuzz) مع الأسماء المسجّلة بقاعدة الأدوية. أي مدخل غير مؤكّد بيتعرض بأقرب اسم مسجّل بدل ما يُتجاهل.
                </p>
              </Section>

              <Section
                num="02"
                title="فحص التفاعلات داخل التركيبة"
                meta={result.interactions.length ? `${result.interactions.length} تفاعل مكتشف` : "بلا تفاعلات"}
                open={open[1]}
                onToggle={() => toggle(1)}
              >
                <div className="grid gap-2.5">
                  {result.interactions.map((it, i) => {
                    const tone = severityTone(it.predicted_severity);
                    const color = tone === "bad" ? "#B5473A" : tone === "warn" ? "#C08A3E" : "#348F80";
                    return (
                      <div key={i} className="flex items-start gap-3.5 rounded-2xl bg-cream px-4 py-3.75">
                        <span className="mt-1.5 h-2 w-2 flex-none rounded-full" style={{ background: color }} />
                        <div className="flex-1">
                          <p dir="ltr" className="text-right font-latin text-[14.5px] text-forest">
                            {it.drug_a_name} × {it.drug_b_name}
                          </p>
                          <p className="mt-1.5 text-sm leading-[1.8] text-ink/72">{it.description}</p>
                          <p className="mt-1 text-[12.5px] text-sand">
                            تصنيف الكتالوج: {severityLabel(it.catalog_severity)} · تقدير النموذج: {Math.round(it.predicted_confidence * 100)}% ثقة
                          </p>
                        </div>
                        <span
                          className="rounded-[9px] px-2.5 py-1 text-[13px] whitespace-nowrap"
                          style={{ color, background: `${color}1a` }}
                        >
                          {severityLabel(it.predicted_severity)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {result.interactions.length === 0 && (
                  <p className="mt-4 text-sm leading-[1.85] text-ink/68">
                    ما ظهر تفاعل مسجّل بين مكوّنات هذه التركيبة. فُحصت كل الأزواج الممكنة، لا الأدوية الجديدة فقط.
                  </p>
                )}
              </Section>

              <Section
                num="03"
                title="البدائل المقترحة"
                meta={
                  result.interactions.flatMap((it) => it.alternatives).length
                    ? `${result.interactions.flatMap((it) => it.alternatives).length} مرشّح`
                    : "بلا بدائل"
                }
                open={open[2]}
                onToggle={() => toggle(2)}
              >
                {result.interactions.some((it) => it.alternatives.length > 0) ? (
                  <div className="grid gap-2.5">
                    {result.interactions.flatMap((it, ii) =>
                      it.alternatives.map((alt, ai) => (
                        <div key={`${it.drug_a_id}-${it.drug_b_id}-${ai}-${ii}`} className="rounded-2xl bg-cream px-4 py-3.75">
                          <div className="flex items-center gap-3.5">
                            <span dir="ltr" className="flex-1 text-right font-latin text-[15.5px] text-forest">
                              {alt.medication_name}
                            </span>
                            <span dir="ltr" className="font-latin text-[12px] text-sand">
                              {alt.generic_name}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-[1.8] text-ink/72">{alt.reason}</p>
                          <p className="mt-1 text-[12.5px] text-sand">
                            بديل عن <span dir="ltr" className="font-latin">{it.drug_b_name}</span> بسبب تفاعله مع{" "}
                            <span dir="ltr" className="font-latin">{it.drug_a_name}</span>
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <p className="text-[14.5px] leading-[1.85] text-ink/68">
                    ما في بدائل مقترحة — إما ما في تفاعل شديد يستدعي بديل، أو ما في بديل آمن متوفّر بقاعدة بياناتنا الحالية بنفس الفئة العلاجية.
                  </p>
                )}
              </Section>
            </section>

            <section className="mt-11 flex flex-wrap items-center justify-between gap-6 border-t border-sand/40 pt-9 sm:mt-16 sm:pt-13">
              <div className="flex flex-wrap items-center gap-5">
                <button
                  onClick={() => {
                    setOpen([true, true, true]);
                    setTimeout(() => window.print(), 60);
                  }}
                  className="print:hidden inline-flex items-center gap-3 rounded-2xl bg-teal px-8.5 py-4 text-[17px] font-medium text-cream shadow-[0_14px_30px_-18px_rgba(9,72,61,0.5)] transition-[box-shadow,transform,background] duration-300 hover:-translate-y-0.5 hover:bg-teal-dark hover:shadow-[0_16px_42px_-12px_rgba(216,154,131,0.72)]"
                >
                  طباعة التقرير الكامل
                </button>
                <Link
                  href="/#tool"
                  onClick={() => setResult(null)}
                  className="print:hidden text-[15px] text-sand"
                >
                  وصفة جديدة
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
