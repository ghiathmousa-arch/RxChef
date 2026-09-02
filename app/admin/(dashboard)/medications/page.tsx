import { prisma } from "@/lib/prisma";
import { MedicationsManager, type MedicationRow } from "./medications-manager";

export const dynamic = "force-dynamic";

export default async function AdminMedicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; class?: string }>;
}) {
  const { q, class: classFilter } = await searchParams;
  const query = (q ?? "").trim();
  const activeClass = (classFilter ?? "").trim();

  const where = {
    AND: [
      query
        ? {
            OR: [
              { name: { contains: query } },
              { genericName: { contains: query } },
              { therapeuticClass: { contains: query } },
            ],
          }
        : {},
      activeClass ? { therapeuticClass: activeClass } : {},
    ],
  };

  const [medications, total, classRows] = await Promise.all([
    prisma.medication.findMany({ where, orderBy: { name: "asc" } }),
    prisma.medication.count(),
    prisma.medication.findMany({
      distinct: ["therapeuticClass"],
      select: { therapeuticClass: true },
      orderBy: { therapeuticClass: "asc" },
    }),
  ]);

  const rows: MedicationRow[] = medications.map((m) => ({
    id: m.id,
    name: m.name,
    genericName: m.genericName,
    dosage: m.dosage,
    therapeuticClass: m.therapeuticClass,
  }));
  const classes = classRows.map((c) => c.therapeuticClass);

  return <MedicationsManager medications={rows} total={total} query={query} classes={classes} activeClass={activeClass} />;
}
