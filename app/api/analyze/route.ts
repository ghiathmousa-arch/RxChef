import { prisma } from "@/lib/prisma";
import { FASTAPI_URL } from "@/lib/config";

// المرحلة 4، البند 2: الربط الحقيقي بين صفحة /tool وخدمة FastAPI.
// Next.js يجيب الكتالوج (أدوية + تفاعلات) من Prisma، يبعته مع أسماء
// الوصفة لـFastAPI /analyze، يسجّل العملية بـOperationLog، ويرجّع
// التقرير الكامل للواجهة.

// الاستضافة المجانية لخدمة التحليل بتنيّم الخدمة عند الخمول، فأول طلب بعد
// فترة سكون بيستنى إقلاع الحاوية (~40 ثانية). المهلة الافتراضية لوظائف
// Vercel عشر ثواني، فبتقطع الطلب قبل ما توصل الخدمة. منمددها للحد الأقصى.
export const maxDuration = 60;

const ANALYSIS_TIMEOUT_MS = 55_000;

export async function POST(request: Request) {
  let drugNames: unknown;
  try {
    const body = await request.json();
    drugNames = body.drugNames;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(drugNames) || drugNames.length === 0) {
    return Response.json(
      { error: "drugNames is required and must be a non-empty array of strings" },
      { status: 400 }
    );
  }

  const [medications, interactions] = await Promise.all([
    prisma.medication.findMany(),
    prisma.interaction.findMany(),
  ]);

  const fastapiRequestBody = {
    drug_names: drugNames,
    medications: medications.map((med) => ({
      id: med.id,
      name: med.name,
      generic_name: med.genericName,
      therapeutic_class: med.therapeuticClass,
    })),
    known_interactions: interactions.map((interaction) => ({
      drug_a_id: interaction.drugAId,
      drug_b_id: interaction.drugBId,
      severity: interaction.severity,
      description: interaction.description,
    })),
  };

  let analysis: {
    matched: unknown[];
    unmatched: unknown[];
    interactions: unknown[];
    summary: Record<string, number>;
  };
  try {
    const response = await fetch(`${FASTAPI_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fastapiRequestBody),
      signal: AbortSignal.timeout(ANALYSIS_TIMEOUT_MS),
    });
    if (!response.ok) {
      return Response.json({ error: "Analysis service returned an error" }, { status: 502 });
    }
    analysis = await response.json();
  } catch {
    return Response.json({ error: "Analysis service unreachable" }, { status: 502 });
  }

  const operation = await prisma.operationLog.create({
    data: {
      inputDrugNames: JSON.stringify(drugNames),
      interactionsFound: analysis.interactions.length,
      unmatchedCount: analysis.unmatched.length,
      alternativesFound: analysis.summary.alternatives_found ?? 0,
      reportJson: JSON.stringify(analysis),
    },
  });

  return Response.json({ ...analysis, operationId: operation.id });
}
