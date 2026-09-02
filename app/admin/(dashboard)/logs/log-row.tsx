"use client";

import { useState } from "react";
import { Badge } from "@/app/components/ui";
import { severityTone, severityLabel } from "@/lib/severity";

export type StoredReport = {
  matched: { query: string; medication_name: string; matched_text: string; score: number }[];
  unmatched: { query: string; closest_guess: string | null; score: number }[];
  interactions: {
    drug_a_name: string;
    drug_b_name: string;
    catalog_severity: string;
    description: string;
    predicted_severity: string;
    predicted_confidence: number;
  }[];
  summary: { total_input: number; matched_count: number; unmatched_count: number; interactions_found: number };
};

export function LogRow({
  id,
  createdAt,
  inputDrugNames,
  interactionsFound,
  unmatchedCount,
  report,
}: {
  id: number;
  createdAt: string;
  inputDrugNames: string[];
  interactionsFound: number;
  unmatchedCount: number;
  report: StoredReport | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-sand/45 bg-paper">
      <div role="button" onClick={() => setOpen((o) => !o)} className="flex cursor-pointer flex-wrap items-center gap-3.5 px-4.5 py-3.75">
        <span className="font-latin text-[12.5px] text-sand">#{id}</span>
        <span dir="ltr" className="font-latin text-[13.5px] text-ink/78">
          {createdAt}
        </span>
        <span className="flex-1 truncate text-[13.5px] text-forest" dir="ltr">
          {inputDrugNames.join(", ")}
        </span>
        <span className="text-[12.5px] text-sand">{interactionsFound} تفاعل</span>
        {unmatchedCount > 0 && <span className="text-[12.5px] text-amber">{unmatchedCount} غير معروف</span>}
        <span className="w-4 text-center font-latin text-[18px] text-teal">{open ? "−" : "+"}</span>
      </div>

      {open && report && (
        <div className="grid gap-4 px-4.5 pb-4.5">
          <div>
            <p className="mb-2 text-[13px] font-semibold text-forest">مطابقة الأسماء</p>
            <div className="grid gap-1.5">
              {report.matched.map((m, i) => (
                <div key={i} dir="ltr" className="flex items-center gap-3 rounded-xl bg-cream px-3.25 py-2.25 text-[13.5px]">
                  <span className="text-ink/55 line-through">{m.query}</span>
                  <span className="text-sand">←</span>
                  <span className="font-latin text-forest">{m.medication_name}</span>
                  <span className="mr-auto font-latin text-teal">{Math.round(m.score)}%</span>
                </div>
              ))}
              {report.unmatched.map((u, i) => (
                <div key={i} dir="ltr" className="flex items-center gap-3 rounded-xl border border-dashed border-sand/70 bg-cream px-3.25 py-2.25 text-[13.5px]">
                  <span className="text-ink/60">{u.query}</span>
                  <span className="mr-auto text-amber">غير موجود بالقاعدة</span>
                </div>
              ))}
            </div>
          </div>

          {report.interactions.length > 0 && (
            <div>
              <p className="mb-2 text-[13px] font-semibold text-forest">التفاعلات المكتشفة</p>
              <div className="grid gap-1.5">
                {report.interactions.map((it, i) => (
                  <div key={i} className="rounded-xl bg-cream px-3.25 py-2.25">
                    <div className="flex items-center gap-3">
                      <span dir="ltr" className="flex-1 font-latin text-[13.5px] text-forest">
                        {it.drug_a_name} × {it.drug_b_name}
                      </span>
                      <Badge tone={severityTone(it.predicted_severity)}>{severityLabel(it.predicted_severity)}</Badge>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-[1.7] text-ink/70">{it.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
