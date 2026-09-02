import type { Tone } from "@/app/components/ui";

const LABELS: Record<string, string> = {
  major: "شديد",
  high: "شديد",
  moderate: "متوسط",
  medium: "متوسط",
  minor: "خفيف",
  low: "خفيف",
};

const TONES: Record<string, Tone> = {
  major: "bad",
  high: "bad",
  moderate: "warn",
  medium: "warn",
  minor: "ok",
  low: "ok",
};

export function severityLabel(severity: string): string {
  return LABELS[severity.toLowerCase()] ?? severity;
}

export function severityTone(severity: string): Tone {
  return TONES[severity.toLowerCase()] ?? "muted";
}
