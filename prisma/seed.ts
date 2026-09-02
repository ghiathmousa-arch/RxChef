// سكربت استيراد مرة وحدة: يقرأ بيانات الأدوية والتفاعلات الحقيقية
// يلي جهّزناها لخدمة FastAPI (api/app/data/*.json) ويعمّر قاعدة البيانات
// عن طريق Prisma. مصدر الحقيقة الوحيد لهالبيانات هو ملفات JSON بمشروع
// FastAPI — هالسكربت بس بينسخها لقاعدة البيانات.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createDatabaseAdapter, requireDatabaseUrl } from "../lib/db-adapter";
import { PrismaClient } from "../app/generated/prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../api/app/data");

type MedicationRow = {
  id: number;
  name: string;
  generic_name: string;
  dosage: string;
  therapeutic_class: string;
};

type InteractionRow = {
  drug_a: string;
  drug_b: string;
  severity: string;
  description: string;
};

async function loadJson<T>(filename: string): Promise<T> {
  const raw = await readFile(path.join(DATA_DIR, filename), "utf-8");
  return JSON.parse(raw) as T;
}

async function main() {
  const prisma = new PrismaClient({ adapter: createDatabaseAdapter(requireDatabaseUrl()) });

  const medications = await loadJson<MedicationRow[]>("medications.json");
  const interactions = await loadJson<InteractionRow[]>("interactions.json");

  console.log(`استيراد ${medications.length} دواء...`);
  await prisma.$transaction(
    medications.map((med) =>
      prisma.medication.upsert({
        where: { id: med.id },
        create: {
          id: med.id,
          name: med.name,
          genericName: med.generic_name,
          dosage: med.dosage,
          therapeuticClass: med.therapeutic_class,
        },
        update: {
          name: med.name,
          genericName: med.generic_name,
          dosage: med.dosage,
          therapeuticClass: med.therapeutic_class,
        },
      })
    )
  );

  const idByGenericName = new Map(medications.map((m) => [m.generic_name, m.id]));

  console.log(`استيراد ${interactions.length} تفاعل...`);
  for (const interaction of interactions) {
    const rawA = idByGenericName.get(interaction.drug_a);
    const rawB = idByGenericName.get(interaction.drug_b);
    if (!rawA || !rawB) {
      throw new Error(
        `دواء غير معروف بتفاعل: ${interaction.drug_a} / ${interaction.drug_b}`
      );
    }
    // ترتيب ثابت (الأصغر أولاً) عشان يطابق @@unique([drugAId, drugBId])
    const [drugAId, drugBId] = rawA < rawB ? [rawA, rawB] : [rawB, rawA];

    await prisma.interaction.upsert({
      where: { drugAId_drugBId: { drugAId, drugBId } },
      create: {
        drugAId,
        drugBId,
        severity: interaction.severity,
        description: interaction.description,
      },
      update: {
        severity: interaction.severity,
        description: interaction.description,
      },
    });
  }

  // خاص بـPostgres: حقن id صريحة ما بيحرّك عدّاد الـsequence، فأول
  // إضافة دواء من لوحة الأدمن بتفشل بتضارب مفتاح. منصفّر العدّاد على
  // أكبر id موجود. (على SQLite ما كانت هالمشكلة موجودة.)
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Medication"', 'id'), COALESCE((SELECT MAX(id) FROM "Medication"), 1))`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Interaction"', 'id'), COALESCE((SELECT MAX(id) FROM "Interaction"), 1))`
  );

  const [medicationCount, interactionCount] = await Promise.all([
    prisma.medication.count(),
    prisma.interaction.count(),
  ]);
  console.log(`تم. بالقاعدة هلق: ${medicationCount} دواء، ${interactionCount} تفاعل.`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
