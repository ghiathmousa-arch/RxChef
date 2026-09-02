// سكربت استيراد مرة وحدة: يقرأ بيانات الأدوية والتفاعلات الحقيقية
// يلي جهّزناها لخدمة FastAPI (api/app/data/*.json) ويعمّر قاعدة البيانات
// عن طريق Prisma. مصدر الحقيقة الوحيد لهالبيانات هو ملفات JSON بمشروع
// FastAPI — هالسكربت بس بينسخها لقاعدة البيانات.

import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createDatabaseAdapter, requireDatabaseUrl } from "../lib/db-adapter";
import { PrismaClient } from "../app/generated/prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../api/app/data");

// عدد الصفوف بكل عملية إدخال جماعي. upsert صف-صف (400 دواء + 2182 تفاعل)
// كان بيعني آلاف الرحلات للسيرفر — فوق اتصال HTTPS بتتجاوز مهلة المعاملة
// (P2028). الإدخال الجماعي بـON CONFLICT بينزّلها لعشر رحلات تقريباً،
// وبيضل idempotent يعني إعادة التشغيل بتحدّث بدل ما تفشل.
const CHUNK_SIZE = 250;

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

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** يبني `($1, $2, ...), ($3, $4, ...)` حسب عدد الصفوف والأعمدة. */
function placeholders(rowCount: number, columnCount: number): string {
  return Array.from({ length: rowCount }, (_, row) =>
    `(${Array.from({ length: columnCount }, (_, col) => `$${row * columnCount + col + 1}`).join(", ")})`
  ).join(", ");
}

async function main() {
  const prisma = new PrismaClient({ adapter: createDatabaseAdapter(requireDatabaseUrl()) });

  const medications = await loadJson<MedicationRow[]>("medications.json");
  const interactions = await loadJson<InteractionRow[]>("interactions.json");

  console.log(`استيراد ${medications.length} دواء...`);
  for (const batch of chunk(medications, CHUNK_SIZE)) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Medication" ("id", "name", "genericName", "dosage", "therapeuticClass", "updatedAt")
       SELECT v.id::int, v.name, v.generic_name, v.dosage, v.therapeutic_class, NOW()
       FROM (VALUES ${placeholders(batch.length, 5)}) AS v(id, name, generic_name, dosage, therapeutic_class)
       ON CONFLICT ("id") DO UPDATE SET
         "name" = EXCLUDED."name",
         "genericName" = EXCLUDED."genericName",
         "dosage" = EXCLUDED."dosage",
         "therapeuticClass" = EXCLUDED."therapeuticClass",
         "updatedAt" = NOW()`,
      ...batch.flatMap((med) => [med.id, med.name, med.generic_name, med.dosage, med.therapeutic_class])
    );
  }

  const idByGenericName = new Map(medications.map((m) => [m.generic_name, m.id]));

  // ترتيب ثابت للزوج (الأصغر أولاً) عشان يطابق @@unique([drugAId, drugBId])،
  // وإزالة التكرار لأن ON CONFLICT ما بيقبل يلمس نفس الصف مرتين بنفس الأمر.
  const pairs = new Map<string, { drugAId: number; drugBId: number; severity: string; description: string }>();
  for (const interaction of interactions) {
    const rawA = idByGenericName.get(interaction.drug_a);
    const rawB = idByGenericName.get(interaction.drug_b);
    if (!rawA || !rawB) {
      throw new Error(`دواء غير معروف بتفاعل: ${interaction.drug_a} / ${interaction.drug_b}`);
    }
    const [drugAId, drugBId] = rawA < rawB ? [rawA, rawB] : [rawB, rawA];
    pairs.set(`${drugAId}-${drugBId}`, {
      drugAId,
      drugBId,
      severity: interaction.severity,
      description: interaction.description,
    });
  }

  console.log(`استيراد ${pairs.size} تفاعل...`);
  for (const batch of chunk([...pairs.values()], CHUNK_SIZE)) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Interaction" ("drugAId", "drugBId", "severity", "description")
       SELECT v.drug_a_id::int, v.drug_b_id::int, v.severity, v.description
       FROM (VALUES ${placeholders(batch.length, 4)}) AS v(drug_a_id, drug_b_id, severity, description)
       ON CONFLICT ("drugAId", "drugBId") DO UPDATE SET
         "severity" = EXCLUDED."severity",
         "description" = EXCLUDED."description"`,
      ...batch.flatMap((i) => [i.drugAId, i.drugBId, i.severity, i.description])
    );
  }

  // خاص بـPostgres: حقن id صريحة ما بيحرّك عدّاد الـsequence، فأول
  // إضافة دواء من لوحة الأدمن بتفشل بتضارب مفتاح. منصفّر العدّاد على
  // أكبر id موجود.
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
