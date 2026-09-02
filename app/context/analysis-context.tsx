"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type MatchedDrug = {
  query: string;
  medication_id: number;
  medication_name: string;
  matched_text: string;
  score: number;
};
export type UnmatchedDrug = { query: string; closest_guess: string | null; score: number };
export type Alternative = {
  medication_id: number;
  medication_name: string;
  generic_name: string;
  reason: string;
};
export type Interaction = {
  drug_a_id: number;
  drug_a_name: string;
  drug_b_id: number;
  drug_b_name: string;
  catalog_severity: string;
  description: string;
  predicted_severity: string;
  predicted_confidence: number;
  alternatives: Alternative[];
};
export type AnalyzeResponse = {
  matched: MatchedDrug[];
  unmatched: UnmatchedDrug[];
  interactions: Interaction[];
  summary: {
    total_input: number;
    matched_count: number;
    unmatched_count: number;
    interactions_found: number;
    alternatives_found: number;
  };
  operationId: number;
};

// آخر نتيجة تحليل حقيقية — مشتركة بين ToolView (يلي بيعبّيها) وصفحة /report
// (يلي بيعرضها). الـProvider معلّق بجذر التطبيق (layout.tsx) عشان النتيجة
// تضل موجودة لما ToolView ينقل المستخدم لـ/report عبر router.push.
type AnalysisContextValue = {
  result: AnalyzeResponse | null;
  setResult: (result: AnalyzeResponse | null) => void;
};

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  return (
    <AnalysisContext.Provider value={{ result, setResult }}>{children}</AnalysisContext.Provider>
  );
}

export function useAnalysis(): AnalysisContextValue {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within an AnalysisProvider");
  return ctx;
}
