import { Card, Eyebrow, PrimaryButton } from "../../components/ui";

const STATS = [
  { value: "400", label: "دواء حقيقي بالقاعدة" },
  { value: "2,182", label: "تفاعل مسجّل · 580 منها موثوق الشدة" },
  { value: "5", label: "خوارزميات، من المطابقة للترتيب" },
  { value: "86.7%", label: "دقة تحقق متقاطع صادقة، لا مقدَّرة" },
];

const SECTIONS = [
  {
    label: "المشكلة",
    text: "المريض المزمن يحمل وصفة فيها أربعة أو خمسة أدوية، ويأتي كل شهر لتجديدها. الطبيب أو الصيدلي يجدّد سطرًا سطرًا: هل الدواء متوفّر؟ إن لم يكن، ما بديله؟ والسؤال الذي يبقى بلا جواب هو الأهم — كيف يؤثّر هذا البديل على بقية الأدوية في نفس الورقة؟ التفاعلات بين مكوّنات قديمة لم يلاحظها أحد تبقى كما هي، لأن أحدًا لم يعد يقرأ الوصفة كوحدة واحدة.",
  },
  {
    label: "الحل",
    text: "RxChef يأخذ الوصفة كاملة مدخلًا واحدًا، ويعيدها تقريرًا واحدًا. المطابقة الضبابية تقبل الإملاء الناقص بدل رفضه؛ فحص التفاعلات يمرّ على كل الأزواج داخل التركيبة لا على المُضاف فقط؛ البدائل تُرتَّب بوزن يجمع التكافؤ العلاجي والتوفّر وأثر البديل على بقية المكوّنات؛ وكل اقتراح يُكتب بجملة تشرح سببه بلغة يمكن قراءتها أمام المريض.",
  },
  {
    label: "حدود الأداة",
    text: "الأداة دعم قرار، لا بديل عنه. لا تكتب وصفة، ولا تحدّد جرعة جديدة، ولا تصرف دواء. مخرجها اقتراح مشروح ومصدره ظاهر، والقرار يبقى للطبيب أو الصيدلي الذي يعرف المريض. كل خطوة قابلة للعرض بتفاصيلها الحرفية، حتى يكون رفض الاقتراح ممكنًا على أساس واضح.",
  },
];

export function AboutView() {
  return (
    <section id="about" className="scroll-mt-28 mx-auto max-w-[1040px]">
      <section className="pt-10 sm:pt-20">
        <Eyebrow>عن المشروع</Eyebrow>
        <h1 className="max-w-[28ch] text-[clamp(30px,3.6vw,44px)] leading-[1.32] font-semibold tracking-[-0.01em] text-forest text-pretty">
          تجديد الوصفة قرار مركّب، والأدوات تتعامل معه كأنه سطر واحد
        </h1>
      </section>

      <section className="mt-9 grid grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-4 sm:gap-3.5">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-sand/40 bg-cream px-4.5 py-5 sm:px-5 sm:py-6"
          >
            <p className="font-latin text-[26px] leading-none font-semibold tabular-nums text-forest sm:text-[30px]">
              {s.value}
            </p>
            <p className="mt-2.5 text-[13px] leading-[1.6] text-ink/64">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-9 grid gap-3.5 sm:mt-14 sm:grid-cols-3">
        {SECTIONS.map((s) => (
          <Card key={s.label} className="p-6 sm:p-[26px]">
            <p className="mb-3 text-[13px] tracking-[0.08em] text-sand">{s.label}</p>
            <p className="text-[15.5px] leading-[1.9] text-ink/82 text-pretty">{s.text}</p>
          </Card>
        ))}
      </section>

      <section className="mt-3.5 rounded-[22px] border-r-4 border-teal/60 bg-cream px-6 py-6 sm:px-9 sm:py-8">
        <p className="mb-3 text-[13px] tracking-[0.08em] text-sand">السياق الأكاديمي</p>
        <p className="text-[16px] leading-[1.95] text-ink/84 text-pretty">
          المشروع بحث تطبيقي في المعلوماتية الصيدلانية: بناء نموذج يعالج الوصفة كوحدة تحليل واحدة، وقياس أثر ذلك على اكتشاف التفاعلات مقارنة بالفحص الفردي لكل دواء. قاعدة الأدوية والقواعد الدوائية مبنية على مراجع التفاعلات المنشورة، والنسخة الحالية نموذج أولي يُوسَّع بالتغذية الراجعة من الأطباء والصيادلة الذين يجرّبونه.
        </p>
        <p className="mt-4 text-[14.5px] leading-[1.9] text-sand">
          لتفاصيل المرجعية والفريق والجهة الأكاديمية:{" "}
          <a href="#contact" className="text-teal hover:text-terracotta">
            صفحة التواصل
          </a>
          .
        </p>
      </section>

      <section className="mt-11 flex flex-wrap items-center gap-5.5 border-t border-sand/40 pt-8 sm:mt-16 sm:pt-12">
        <PrimaryButton href="#tool">جرّب الأداة</PrimaryButton>
        <a href="#how-it-works" className="text-[15px]">
          كيف تعمل الخطوات الخمس ←
        </a>
      </section>
    </section>
  );
}
