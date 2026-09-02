import { Eyebrow, PrimaryButton } from "../../components/ui";

const STEPS = [
  { num: "1", title: "اكتب أسماء الأدوية", desc: "دواء بكل سطر، بالإملاء يلي عندك — حتى لو فيه خطأ بسيط." },
  { num: "2", title: "اضغط «حلّل الوصفة»", desc: "الفحص بياخد ثواني: مطابقة، فحص تفاعلات، تصنيف شدة، وترتيب بدائل." },
  { num: "3", title: "راجع النتيجة", desc: "كل دواء متأكد منه، كل تفاعل مكتشف بشدته، وكل بديل مع سبب اقتراحه." },
];

export function QuickStartView() {
  return (
    <section id="quick-start" className="scroll-mt-28 mx-auto max-w-[1040px]">
      <section className="pt-10 pb-7 sm:pt-20 sm:pb-11">
        <Eyebrow>دليل الاستخدام السريع</Eyebrow>
        <h1 className="max-w-[24ch] text-[clamp(30px,3.6vw,44px)] leading-[1.32] font-semibold tracking-[-0.01em] text-forest text-pretty">
          ثلاث خطوات، أقل من دقيقة
        </h1>
      </section>

      <section className="grid gap-3.5 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.num} className="rounded-[22px] border border-sand/40 bg-paper p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-teal/30 bg-teal/12 font-latin text-[14px] text-forest">
              {s.num}
            </span>
            <p className="mt-4 text-[16px] font-semibold text-forest">{s.title}</p>
            <p className="mt-2 text-[14.5px] leading-[1.85] text-ink/72">{s.desc}</p>
          </div>
        ))}
      </section>

      <section className="mt-7 overflow-hidden rounded-[24px] border border-sand/42 bg-paper shadow-[0_24px_54px_-40px_rgba(9,72,61,0.34)]">
        <div className="flex items-center gap-2 border-b border-sand/30 bg-cream px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-sand/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-sand/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-sand/60" />
          <span className="mr-2 font-latin text-[12px] text-sand">rxchef.app/tool</span>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <p className="mb-2 text-[12.5px] text-sand">مثال — وصفة مكتوبة بخط سريع</p>
            <div dir="ltr" className="grid gap-1.5 rounded-2xl bg-cream p-3.5 font-latin text-[14px] text-ink/80">
              <p>Aspirn</p>
              <p>Coumadin</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-[12.5px] text-sand">النتيجة</p>
            <div className="grid gap-1.5">
              <div dir="ltr" className="flex items-center justify-between rounded-xl bg-cream px-3.5 py-2.5">
                <span className="font-latin text-[13.5px] text-forest">Aspirin</span>
                <span className="rounded-lg bg-teal/12 px-2 py-0.5 font-latin text-[11.5px] text-teal">92%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-rust/10 px-3.5 py-2.5">
                <span dir="ltr" className="font-latin text-[13.5px] text-forest">Aspirin × Coumadin</span>
                <span className="rounded-lg bg-rust/15 px-2 py-0.5 text-[11.5px] text-rust">شديد</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 flex justify-center">
        <PrimaryButton href="#tool">جرّب فعليًا الآن</PrimaryButton>
      </section>
    </section>
  );
}
