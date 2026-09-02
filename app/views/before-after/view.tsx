import { Eyebrow } from "../../components/ui";

const ROWS = [
  {
    label: "فحص التفاعلات",
    before: "الصيدلي يتذكّر التفاعلات الشائعة بس، والتفاعل بين دواءين قديمين بالوصفة ممكن يفوته.",
    after: "كل الأزواج الممكنة داخل الوصفة تُفحص تلقائيًا، مو بس الدواء المُضاف حديثًا.",
  },
  {
    label: "قراءة الاسم",
    before: "خطأ إملائي بسيط بالوصفة المكتوبة بخط اليد يوصل لرفض المدخل أو تجاهله.",
    after: "الاسم القريب يُقترح بنسبة تطابق واضحة، والقرار يبقى للصيدلي أو الطبيب.",
  },
  {
    label: "إيجاد بديل",
    before: "البحث عن بديل يدوي، بدون ضمان إنه البديل نفسه ما رح يخلق تفاعل جديد مع بقية الوصفة.",
    after: "البدائل تُرتَّب بوزن يحسب أثرها على كل مكوّنات الوصفة الباقية، مو بس التكافؤ العلاجي.",
  },
  {
    label: "توثيق القرار",
    before: "سبب رفض أو قبول اقتراح غالبًا ما يُكتب أو يُحفظ بأي مكان.",
    after: "كل اقتراح مربوط بجملة تشرح سببه، وكل عملية تحليل محفوظة بسجل قابل للمراجعة لاحقًا.",
  },
];

export function BeforeAfterView() {
  return (
    <section id="before-after" className="scroll-mt-28 mx-auto max-w-[1040px]">
      <section className="pt-10 pb-7 sm:pt-20 sm:pb-11">
        <Eyebrow>قبل وبعد</Eyebrow>
        <h1 className="max-w-[26ch] text-[clamp(30px,3.6vw,44px)] leading-[1.32] font-semibold tracking-[-0.01em] text-forest text-pretty">
          نفس القرار، طريقة مختلفة بالوصول له
        </h1>
        <p className="mt-5 max-w-[54ch] text-[16.5px] leading-[1.9] text-ink/76">
          RxChef ما بياخد القرار عن الطبيب أو الصيدلي — بس بيغيّر شو بيوصله من معلومة قبل ما يقرر.
        </p>
      </section>

      <section className="grid gap-2.5">
        {ROWS.map((r) => (
          <div
            key={r.label}
            className="grid gap-3 rounded-[22px] border border-sand/40 bg-paper p-6 sm:grid-cols-[140px_1fr_1fr] sm:items-center sm:gap-6 sm:p-7"
          >
            <p className="text-[13px] tracking-[0.06em] text-sand">{r.label}</p>
            <div className="rounded-2xl bg-cream px-4.5 py-3.5">
              <p className="mb-1.5 text-[11.5px] tracking-[0.08em] text-rust">قبل</p>
              <p className="text-[14.5px] leading-[1.8] text-ink/74">{r.before}</p>
            </div>
            <div className="rounded-2xl bg-teal/8 px-4.5 py-3.5">
              <p className="mb-1.5 text-[11.5px] tracking-[0.08em] text-teal">مع RxChef</p>
              <p className="text-[14.5px] leading-[1.8] text-ink/82">{r.after}</p>
            </div>
          </div>
        ))}
      </section>
    </section>
  );
}
