import { prisma } from "@/lib/prisma";
import { Eyebrow } from "../../components/ui";
import { ClassesAccordion } from "./accordion";

export async function ClassesView() {
  const medications = await prisma.medication.findMany({
    select: { id: true, name: true, genericName: true, therapeuticClass: true },
    orderBy: { name: "asc" },
  });

  const grouped = new Map<string, { id: number; name: string; genericName: string }[]>();
  for (const med of medications) {
    const list = grouped.get(med.therapeuticClass) ?? [];
    list.push({ id: med.id, name: med.name, genericName: med.genericName });
    grouped.set(med.therapeuticClass, list);
  }
  const allClasses = [...grouped.entries()].sort((a, b) => b[1].length - a[1].length);
  const topClasses = allClasses.slice(0, 5);

  return (
    <section id="classes" className="scroll-mt-28 mx-auto max-w-[1040px]">
      <section className="pt-10 pb-7 sm:pt-20 sm:pb-11">
        <Eyebrow>دليل التصنيفات العلاجية</Eyebrow>
        <h1 className="max-w-[26ch] text-[clamp(30px,3.6vw,44px)] leading-[1.32] font-semibold tracking-[-0.01em] text-forest text-pretty">
          {allClasses.length} فئة علاجية، {medications.length} دواء حقيقي مصنّف تحتها
        </h1>
        <p className="mt-5 max-w-[54ch] text-[16.5px] leading-[1.9] text-ink/76">
          كل فئة تجمع الأدوية يلي بتشتغل بنفس الآلية — وهي نفسها أساس ترتيب البدائل: الأداة ما بتقترح بديلًا من فئة علاجية مختلفة. تحت أكبر 5 فئات (من أصل {allClasses.length}) — الباقي فيك تشوفه من لوحة الإدارة.
        </p>
      </section>

      <ClassesAccordion classes={topClasses} />
    </section>
  );
}
