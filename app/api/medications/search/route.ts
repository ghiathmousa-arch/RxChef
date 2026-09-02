import { prisma } from "@/lib/prisma";

// اقتراحات حيّة أثناء الكتابة بالأداة — بحث substring بسيط على قاعدة
// الأدوية الحقيقية (Prisma/Postgres). هاد بحث تقريبي للراحة بس، مش سلطة
// المطابقة النهائية — تلك تصير بخوارزمية fuzzy matching الحقيقية بـFastAPI
// وقت الضغط على "حلّل الوصفة".
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return Response.json({ results: [] });
  }

  const matches = await prisma.medication.findMany({
    where: {
      // mode: "insensitive" ضروري على Postgres — بعكس SQLite، `contains`
      // عنده حسّاس لحالة الأحرف، فبحث "cou" ما كان بيلاقي "Coumadin".
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { genericName: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 20,
    orderBy: { name: "asc" },
  });

  const lower = q.toLowerCase();
  const ranked = matches
    .map((m) => ({
      m,
      rank: m.name.toLowerCase().startsWith(lower) ? 0 : m.genericName.toLowerCase().startsWith(lower) ? 1 : 2,
    }))
    .sort((a, b) => a.rank - b.rank || a.m.name.localeCompare(b.m.name))
    .slice(0, 6)
    .map(({ m }) => ({
      id: m.id,
      name: m.name,
      genericName: m.genericName,
      dosage: m.dosage,
      therapeuticClass: m.therapeuticClass,
    }));

  return Response.json({ results: ranked });
}
