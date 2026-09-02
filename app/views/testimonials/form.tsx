"use client";

import { useState } from "react";

const ROLES = ["طبيب", "صيدلي", "طالب", "أخرى"];

export function TestimonialForm() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("طبيب");
  const [quote, setQuote] = useState("");
  const [sent, setSent] = useState(false);
  const [tried, setTried] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const valid = name.trim().length > 1 && quote.trim().length > 14;

  async function submit() {
    if (!valid) {
      setTried(true);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, quote }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setSubmitError("تعذّر إرسال التجربة. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-sand/42 bg-paper p-6 sm:p-8">
        <p className="text-lg font-semibold text-forest">وصلت تجربتك، شكرًا</p>
        <p className="mt-2.5 text-[15px] leading-[1.9] text-ink/74">
          نراجعها يدويًا قبل نشرها بالصفحة — هيك ما بينشر شي غير موثّق.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-sand/42 bg-paper p-6 sm:p-8">
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-forest">الاسم</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم الكامل"
              className="w-full rounded-2xl border border-sand/50 bg-cream px-[15px] py-3.5 text-base text-ink outline-none focus:border-teal/55"
            />
          </label>
          <div>
            <span className="mb-2 block text-sm text-forest">أنت</span>
            <div className="flex flex-wrap gap-2.5">
              {ROLES.map((r) => {
                const active = role === r;
                return (
                  <span
                    key={r}
                    role="button"
                    onClick={() => setRole(r)}
                    className="cursor-pointer rounded-xl border px-4 py-2.5 text-[14.5px]"
                    style={{
                      background: active ? "rgba(52,143,128,.12)" : "#F6F5F1",
                      borderColor: active ? "rgba(52,143,128,.34)" : "rgba(175,184,181,.45)",
                      color: active ? "#09483D" : "rgba(22,34,31,.62)",
                    }}
                  >
                    {r}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm text-forest">تجربتك</span>
          <textarea
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={4}
            placeholder="شو جرّبت بالأداة، وكيف أثّرت على تجديد الوصفة عندك؟"
            className="w-full resize-y rounded-2xl border border-sand/50 bg-cream px-[15px] py-3.5 text-base leading-[1.8] text-ink outline-none focus:border-teal/55"
          />
        </label>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-4.5">
          <button
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-3 rounded-2xl bg-teal px-8.5 py-4 text-[17px] font-medium text-cream shadow-[0_14px_30px_-18px_rgba(9,72,61,0.5)] transition-[box-shadow,transform,background] duration-300 hover:bg-teal-dark hover:shadow-[0_16px_42px_-12px_rgba(216,154,131,0.72)]"
            style={{ opacity: valid && !submitting ? 1 : 0.5, cursor: valid && !submitting ? "pointer" : "not-allowed" }}
          >
            {submitting ? "جارٍ الإرسال..." : "شارك تجربتك"}
          </button>
          <span className="text-[13.5px]" style={{ color: submitError || (tried && !valid) ? "#C08A3E" : "#AFB8B5" }}>
            {submitError ?? (tried && !valid ? "أكمل الاسم ونص التجربة (15 حرف ع الأقل)" : "تُراجَع يدويًا قبل النشر")}
          </span>
        </div>
      </div>
    </div>
  );
}
