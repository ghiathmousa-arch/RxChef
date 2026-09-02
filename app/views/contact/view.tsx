"use client";

import { useState } from "react";
import { Eyebrow } from "../../components/ui";

const ROLES = ["طبيب", "صيدلي", "طالب", "أخرى"];

export function ContactView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("طبيب");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [tried, setTried] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const valid = name.trim().length > 1 && /.+@.+\..+/.test(email.trim()) && message.trim().length > 9;

  async function submit() {
    if (!valid) {
      setTried(true);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, role }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setTried(false);
    } catch {
      setSubmitError("تعذّر إرسال الملاحظة. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="scroll-mt-28 mx-auto max-w-[760px]">
      <section className="pt-10 pb-7 sm:pt-20 sm:pb-10.5">
        <Eyebrow>تواصل</Eyebrow>
        <h1 className="max-w-[22ch] text-[clamp(30px,3.6vw,44px)] leading-[1.32] font-semibold tracking-[-0.01em] text-forest text-pretty">
          اكتب لنا ملاحظة أو دواءً ناقصًا
        </h1>
        <p className="mt-5 max-w-[52ch] text-[16.5px] leading-[1.9] text-ink/76">
          ملاحظات الأطباء والصيادلة هي ما يوسّع قاعدة الأدوية وقواعد التفاعل. إن صادفت اسمًا غير مسجّل أو تنبيهًا تراه في غير موضعه، أخبرنا به وبالوصفة التي ظهر فيها.
        </p>
      </section>

      <section className="rounded-3xl border border-sand/42 bg-paper p-6 shadow-[0_24px_54px_-38px_rgba(9,72,61,0.34)] sm:p-8">
        {sent ? (
          <div className="flex items-start gap-3.5 py-1.5">
            <span className="mt-2.5 h-2.5 w-2.5 flex-none rounded-full bg-teal" />
            <div>
              <p className="text-lg font-semibold text-forest">وصلت ملاحظتك</p>
              <p className="mt-2.5 text-[15.5px] leading-[1.9] text-ink/74">
                نقرأ الملاحظات يدويًا ونردّ على بريدك إن كان السؤال يستدعي ردًّا. شكرًا للوقت.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setName("");
                  setEmail("");
                  setMessage("");
                }}
                className="mt-4 inline-block cursor-pointer text-[15px]"
              >
                أرسل ملاحظة أخرى
              </button>
            </div>
          </div>
        ) : (
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
              <label className="block">
                <span className="mb-2 block text-sm text-forest">البريد الإلكتروني</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  className="w-full rounded-2xl border border-sand/50 bg-cream px-[15px] py-3.5 text-right font-latin text-[15.5px] text-ink outline-none focus:border-teal/55"
                />
              </label>
            </div>

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

            <label className="block">
              <span className="mb-2 block text-sm text-forest">الملاحظة</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="اكتب الملاحظة، ومعها اسم الدواء أو الوصفة التي ظهرت فيها إن أمكن."
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
                {submitting ? "جارٍ الإرسال..." : "أرسل الملاحظة"}
              </button>
              <span className="text-[13.5px]" style={{ color: submitError || (tried && !valid) ? "#C08A3E" : "#AFB8B5" }}>
                {submitError ?? (tried && !valid ? "أكمل الاسم والبريد ونصّ الملاحظة" : "لا نطلب بيانات مريض، ولا نستخدم بريدك لغير الردّ")}
              </span>
            </div>
          </div>
        )}
      </section>

      <section className="mt-8.5 grid gap-5.5 sm:grid-cols-2 sm:mt-13">
        <div>
          <p className="mb-2 text-[13px] tracking-[0.08em] text-sand">بريد المشروع</p>
          <p dir="ltr" className="text-right font-latin text-[15.5px] text-forest">hello@rxchef.app</p>
        </div>
        <div>
          <p className="mb-2 text-[13px] tracking-[0.08em] text-sand">للتعاون الأكاديمي</p>
          <p className="text-[15.5px] leading-[1.8] text-ink/76">اذكر جهتك في الملاحظة ونرسل لك ورقة المنهجية وقاعدة القواعد الحالية.</p>
        </div>
      </section>
    </section>
  );
}
