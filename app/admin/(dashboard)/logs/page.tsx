import { prisma } from "@/lib/prisma";
import { LogRow, type StoredReport } from "./log-row";

export const dynamic = "force-dynamic";

function safeParseDrugNames(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function safeParseReport(raw: string): StoredReport | null {
  try {
    return JSON.parse(raw) as StoredReport;
  } catch {
    return null;
  }
}

export default async function AdminLogsPage() {
  const logs = await prisma.operationLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div>
      <div className="mb-5">
        <p className="text-xl font-semibold text-forest">سجل العمليات</p>
        <p className="mt-1.75 text-[13.5px] text-sand">كل تحليل جرى على الأداة، مع عدد التفاعلات المكتشفة والأدوية غير المطابقة.</p>
      </div>

      <div className="grid gap-2.5">
        {logs.map((log) => (
          <LogRow
            key={log.id}
            id={log.id}
            createdAt={log.createdAt.toLocaleString("ar-SY", { dateStyle: "medium", timeStyle: "short" })}
            inputDrugNames={safeParseDrugNames(log.inputDrugNames)}
            interactionsFound={log.interactionsFound}
            unmatchedCount={log.unmatchedCount}
            report={safeParseReport(log.reportJson)}
          />
        ))}
        {logs.length === 0 && <p className="text-[14px] text-sand">لا توجد عمليات تحليل مسجّلة بعد.</p>}
      </div>
    </div>
  );
}
