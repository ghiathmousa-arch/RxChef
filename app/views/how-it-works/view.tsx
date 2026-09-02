import { Eyebrow } from "../../components/ui";

export function HowItWorksView() {
  return (
    <section id="how-it-works" className="scroll-mt-28 mx-auto max-w-[1100px]">
      <section className="pt-11 pb-7 sm:pt-16 sm:pb-11">
        <Eyebrow>كيف يعمل</Eyebrow>
        <h1 className="max-w-[26ch] text-[clamp(30px,3.6vw,46px)] leading-[1.3] font-semibold tracking-[-0.01em] text-forest text-pretty">
          خمس خطوات، كل واحدة تحلّ مشكلة واحدة
        </h1>
        <p className="mt-5 max-w-[54ch] text-[16.5px] leading-[1.9] text-ink/76">
          التركيبة تمرّ على خمسة إجراءات بالترتيب. هنا كل إجراء بلغة واضحة ومثال حقيقي من وصفة، ولمن يريد التفصيل صفحة خاصة بكل واحد.
        </p>
      </section>

      <section className="grid gap-6">
        {/* Step 01 */}
        <div className="grid items-center gap-8 rounded-[26px] border border-sand/42 bg-paper p-6 shadow-[0_24px_54px_-40px_rgba(9,72,61,0.34)] sm:p-10 md:grid-cols-2 md:gap-14">
          <div>
            <div className="mb-4.5 flex items-center gap-3.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-teal/30 bg-teal/12 font-latin text-[15px] text-forest">
                01
              </span>
              <span className="text-[13px] text-sand">
                المطابقة الضبابية · <span className="font-latin">Fuzzy Matching</span>
              </span>
            </div>
            <p className="text-[clamp(21px,2.3vw,27px)] leading-[1.5] font-semibold text-forest text-pretty">
              نقرأ الاسم كما كتبته، لا كما يجب أن يكون
            </p>
            <p className="mt-4 text-base leading-[1.95] text-ink/78">
              نقيس قرب ما كتبته من كل اسم مسجّل في القاعدة، ونعرض أقرب الأسماء مع نسبة التطابق لتؤكّد أنت، بدل أن نرفض المدخل.
            </p>
            <a href="#algorithm" className="mt-5.5 inline-block text-[15px]">
              اعرف أكتر ←
            </a>
          </div>
          <div className="grid gap-2">
            <div dir="ltr" className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3.5">
              <span className="font-latin text-[13.5px] text-ink/55 line-through">Metfformin</span>
              <span className="h-px flex-1 bg-linear-to-r from-sand/70 to-teal/50" />
              <span className="font-latin text-[14.5px] text-forest">Metformin 500mg</span>
              <span className="rounded-lg bg-teal/12 px-2.5 py-1 font-latin text-[12.5px] text-teal">97%</span>
            </div>
            <div dir="ltr" className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3.5">
              <span className="font-latin text-[13.5px] text-ink/55 line-through">Amoxicilin</span>
              <span className="h-px flex-1 bg-linear-to-r from-sand/70 to-teal/50" />
              <span className="font-latin text-[14.5px] text-forest">Amoxicillin 500mg</span>
              <span className="rounded-lg bg-teal/12 px-2.5 py-1 font-latin text-[12.5px] text-teal">95%</span>
            </div>
            <div dir="ltr" className="flex items-center gap-3 rounded-2xl border border-dashed border-sand/75 bg-cream px-4 py-3.5">
              <span className="font-latin text-[13.5px] text-ink/60">Vitacomplex</span>
              <span className="h-px flex-1 bg-sand/50" />
              <span dir="rtl" className="text-[12.5px] text-amber">لا مقابل مسجّل</span>
            </div>
          </div>
        </div>

        {/* Step 02 */}
        <div
          className="rounded-[26px] p-6 shadow-[0_30px_66px_-40px_rgba(9,72,61,0.55)] sm:p-11"
          style={{ background: "linear-gradient(150deg,#0C4A3F,#296F62 62%,#3B8477)" }}
        >
          <div className="mb-5 flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-cream/14 font-latin text-[15px] text-cream">
              02
            </span>
            <span className="text-[13px] text-cream/60">
              فحص التفاعلات · <span className="font-latin">Interaction Check</span>
            </span>
          </div>
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-13">
            <div>
              <p className="text-[clamp(21px,2.3vw,27px)] leading-[1.5] font-semibold text-cream text-pretty">
                نفحص الوصفة كلها، لا الدواء الجديد فقط
              </p>
              <p className="mt-4 text-base leading-[1.95] text-cream/80">
                نبني كل الأزواج الممكنة داخل التركيبة ونفحصها واحدًا واحدًا، فالتفاعل قد يكون بين دوائين قديمين لم يلاحظهما أحد.
              </p>
              <a href="#algorithm" className="mt-5.5 inline-block text-[15px] text-terracotta">
                اعرف أكتر ←
              </a>
            </div>
            <div dir="ltr" className="flex items-center justify-center gap-8 sm:gap-10">
              <div className="text-center">
                <p className="font-latin text-[clamp(40px,5vw,64px)] leading-none font-medium text-cream">4</p>
                <p dir="rtl" className="mt-2.5 text-[13.5px] text-cream/62">أدوية في الوصفة</p>
              </div>
              <span className="font-latin text-2xl text-cream/40">→</span>
              <div className="text-center">
                <p className="font-latin text-[clamp(40px,5vw,64px)] leading-none font-medium text-terracotta">6</p>
                <p dir="rtl" className="mt-2.5 text-[13.5px] text-cream/62">أزواج تُفحص كلها</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 03 */}
        <div className="grid items-center gap-8 rounded-[26px] border border-sand/42 bg-paper p-6 shadow-[0_24px_54px_-40px_rgba(9,72,61,0.34)] sm:p-10 md:grid-cols-2 md:gap-14">
          <div className="grid gap-2">
            <div className="flex -rotate-[1.5deg] items-center gap-3 rounded-2xl border border-teal/30 bg-cream px-4 py-3.5 shadow-[0_10px_22px_-18px_rgba(9,72,61,0.5)]">
              <span className="font-latin text-[12.5px] text-teal">1</span>
              <span dir="ltr" className="flex-1 text-right font-latin text-[14.5px] text-forest">Nifedipine SR 30mg</span>
              <span className="rounded-lg bg-teal/12 px-2.5 py-1 text-xs whitespace-nowrap text-teal">لا تفاعل جديد</span>
            </div>
            <div className="flex rotate-1 items-center gap-3 rounded-2xl bg-cream px-4 py-3.5">
              <span className="font-latin text-[12.5px] text-sand">2</span>
              <span dir="ltr" className="flex-1 text-right font-latin text-[14.5px] text-forest">Felodipine 5mg</span>
              <span className="text-xs whitespace-nowrap text-sand">توفّر أضيق</span>
            </div>
            <div className="flex -rotate-1 items-center gap-3 rounded-2xl bg-cream px-4 py-3.5 opacity-90">
              <span className="font-latin text-[12.5px] text-sand">3</span>
              <span dir="ltr" className="flex-1 text-right font-latin text-[14.5px] text-forest">Diltiazem SR 120mg</span>
              <span className="rounded-lg bg-amber/12 px-2.5 py-1 text-xs whitespace-nowrap text-amber">يضيف تفاعلًا</span>
            </div>
          </div>
          <div>
            <div className="mb-4.5 flex items-center gap-3.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-terracotta/42 bg-terracotta/18 font-latin text-[15px] text-forest">
                03
              </span>
              <span className="text-[13px] text-sand">
                ترتيب البدائل · <span className="font-latin">Alternative Ranking</span>
              </span>
            </div>
            <p className="text-[clamp(21px,2.3vw,27px)] leading-[1.5] font-semibold text-forest text-pretty">
              نرتّب البدائل، لا نرمي قائمة
            </p>
            <p className="mt-4 text-base leading-[1.95] text-ink/78">
              كل بديل يُوزن بثلاثة أوزان: التكافؤ العلاجي، التوفّر الفعلي، وأثره على بقية التركيبة. البديل الذي يحلّ مشكلة ويخلق أخرى ينزل ترتيبه.
            </p>
            <a href="#algorithm" className="mt-5.5 inline-block text-[15px]">
              اعرف أكتر ←
            </a>
          </div>
        </div>

        {/* Step 04 */}
        <div className="rounded-[26px] border border-sand/42 bg-paper p-6 shadow-[0_24px_54px_-40px_rgba(9,72,61,0.34)] sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[46ch]">
              <div className="mb-4.5 flex items-center gap-3.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-amber/36 bg-amber/14 font-latin text-[15px] text-forest">
                  04
                </span>
                <span className="text-[13px] text-sand">
                  تصنيف الشدة · <span className="font-latin">Severity Classification</span>
                </span>
              </div>
              <p className="text-[clamp(21px,2.3vw,27px)] leading-[1.5] font-semibold text-forest text-pretty">
                نقول شدّة التفاعل بلغة قرار
              </p>
              <p className="mt-4 text-base leading-[1.95] text-ink/78">
                كل تفاعل يأخذ درجة واحدة من ثلاث، ومع الدرجة جملة تقول ماذا يفعل الطبيب: يتابع، يراقب مخبريًا، أو يعيد النظر في المكوّن.
              </p>
            </div>
            <a href="#algorithm" className="text-[15px]">
              اعرف أكتر ←
            </a>
          </div>
          <div className="mt-6.5 grid gap-2.5 sm:grid-cols-3">
            <div className="rounded-2xl border-t-[3px] border-rust bg-cream p-4.5">
              <p className="font-medium text-forest">شدة عالية</p>
              <p className="mt-2 text-sm leading-[1.75] text-ink/70">يعيد النظر في المكوّن — قرار صريح مطلوب.</p>
            </div>
            <div className="rounded-2xl border-t-[3px] border-amber bg-cream p-4.5">
              <p className="font-medium text-forest">شدة متوسطة</p>
              <p className="mt-2 text-sm leading-[1.75] text-ink/70">يراقب مخبريًا أو يفصل الجرعات بأربع ساعات.</p>
            </div>
            <div className="rounded-2xl border-t-[3px] border-sand bg-cream p-4.5">
              <p className="font-medium text-forest">شدة منخفضة</p>
              <p className="mt-2 text-sm leading-[1.75] text-ink/70">يُذكر للمريض ولا يُغيَّر في الوصفة.</p>
            </div>
          </div>
        </div>

        {/* Step 05 */}
        <div className="rounded-[26px] border border-sand/42 bg-paper p-6 shadow-[0_24px_54px_-40px_rgba(9,72,61,0.34)] sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[46ch]">
              <div className="mb-4.5 flex items-center gap-3.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-teal/30 bg-teal/12 font-latin text-[15px] text-forest">
                  05
                </span>
                <span className="text-[13px] text-sand">
                  مقارنة النماذج · <span className="font-latin">Model Comparison</span>
                </span>
              </div>
              <p className="text-[clamp(21px,2.3vw,27px)] leading-[1.5] font-semibold text-forest text-pretty">
                نقارن ثلاثة نماذج بنفس الاختبار، لا نختار واحدًا بالانطباع
              </p>
              <p className="mt-4 text-base leading-[1.95] text-ink/78">
                قبل ما يشتغل تصنيف الشدة، ندرّب ثلاثة نماذج على نفس البيانات وبنفس التحقق المتقاطع (5 طيّات)، ونعتمد الأعلى دقة فقط — مرة واحدة عند بناء النظام، لا في كل تحليل.
              </p>
              <a href="#algorithm" className="mt-5.5 inline-block text-[15px]">
                اعرف أكتر ←
              </a>
            </div>
          </div>
          <div className="mt-6.5 grid gap-2.5">
            <div className="flex items-center gap-4 rounded-2xl bg-cream px-4.5 py-3.5">
              <span className="w-[136px] shrink-0 text-[14px] font-medium text-forest">XGBoost</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand/25">
                <span className="block h-full rounded-full bg-teal" style={{ width: "86.7%" }} />
              </span>
              <span dir="ltr" className="w-14 shrink-0 font-latin text-[13.5px] text-forest">86.7%</span>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-cream px-4.5 py-3.5">
              <span className="w-[136px] shrink-0 text-[14px] font-medium text-forest">Random Forest</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand/25">
                <span className="block h-full rounded-full bg-teal/65" style={{ width: "86.4%" }} />
              </span>
              <span dir="ltr" className="w-14 shrink-0 font-latin text-[13.5px] text-forest">86.4%</span>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-cream px-4.5 py-3.5">
              <span className="w-[136px] shrink-0 text-[14px] font-medium text-forest">Logistic Regression</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand/25">
                <span className="block h-full rounded-full bg-amber" style={{ width: "75.0%" }} />
              </span>
              <span dir="ltr" className="w-14 shrink-0 font-latin text-[13.5px] text-forest">75.0%</span>
            </div>
          </div>
          <p className="mt-4.5 text-sm leading-[1.85] text-ink/68">
            الأرقام دقة تحقق متقاطع حقيقية على 580 تفاعلًا موثوق الشدة، مش تقديرات — XGBoost اعتُمد لأنه الأعلى.
          </p>
        </div>
      </section>
    </section>
  );
}
