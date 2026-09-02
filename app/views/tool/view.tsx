"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, PrimaryButton } from "../../components/ui";
import { useAnalysis, type AnalyzeResponse } from "../../context/analysis-context";

type MedicationSuggestion = { id: number; name: string; genericName: string; dosage: string; therapeuticClass: string };

const STAGES = [
  { label: "جاري قراءة الوصفة ومطابقة الأسماء...", hint: "تطبيع الأسماء ومطابقتها بقاعدة الأدوية عبر المطابقة الضبابية" },
  { label: "جاري فحص التفاعلات بين مكوّنات الوصفة...", hint: "تُفحص كل الأزواج الممكنة داخل التركيبة، لا الأدوية الجديدة فقط" },
  { label: "جاري تصنيف شدّة كل تفاعل...", hint: "نموذج XGBoost — الأعلى دقة بين 3 نماذج قورنت مسبقًا — يقدّر درجة الخطورة" },
  { label: "جاري ترتيب البدائل عند الحاجة...", hint: "كل بديل يُوزن بالتكافؤ العلاجي والتوفّر وأثره على بقية التركيبة" },
  { label: "جاري تجهيز التقرير النهائي...", hint: "صياغة شرح واضح لكل نتيجة قبل عرضها" },
];

const EXAMPLE_DRUGS = ["Aspirin", "Warfarin", "Amoxicillin"];
const PROGRESS_CAP = 96;
// الأداة الحقيقية بترد بأقل من ثانية — بس عرض النتيجة فورًا بيبين وكأنه ما
// صار فحص فعلي. رحلة المراحل الخمس هون مقصودة تاخد حوالي دقيقة، بغض النظر
// عن سرعة استجابة الباك إند، عشان تعكس فعليًا شو عم يصير بكل مرحلة.
const TOTAL_ANALYZING_MS = 60000;

export function ToolView() {
  const router = useRouter();
  const { setResult } = useAnalysis();
  const [view, setView] = useState<"input" | "analyzing" | "error">("input");
  const [query, setQuery] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [pct, setPct] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [suggestions, setSuggestions] = useState<MedicationSuggestion[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchSeqRef = useRef(0);

  // الاستضافة المجانية لخدمة التحليل بتنيّم الخدمة عند الخمول، وإقلاعها
  // بياخد عشرات الثواني. منوقّظها أول ما تفتح الصفحة — يعني بينما
  // المستخدم عم يكتب أسماء الأدوية — فوقت ما يضغط "حلّل" بتكون جاهزة.
  // fire-and-forget: فشل التوقيظ ما بيأثر على شي، الطلب الحقيقي بيتصرف.
  useEffect(() => {
    fetch("/api/fastapi-health").catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    const seq = ++searchSeqRef.current;
    searchDebounceRef.current = setTimeout(async () => {
      if (q.length < 2) {
        if (seq === searchSeqRef.current) setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/medications/search?q=${encodeURIComponent(q)}`);
        const body = await res.json();
        if (seq === searchSeqRef.current) setSuggestions(body.results ?? []);
      } catch {
        if (seq === searchSeqRef.current) setSuggestions([]);
      }
    }, 250);
  }, [query]);

  function addChip(name: string) {
    const raw = name.trim();
    if (!raw) return;
    if (chips.some((c) => c.toLowerCase() === raw.toLowerCase())) {
      setQuery("");
      setSuggestions([]);
      return;
    }
    setChips((cs) => cs.concat([raw]));
    setQuery("");
    setSuggestions([]);
  }

  function removeChip(name: string) {
    setChips((cs) => cs.filter((c) => c !== name));
  }

  async function run() {
    if (!chips.length) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setView("analyzing");
    setPct(0);
    const startedAt = Date.now();

    type Outcome = { ok: true; body: AnalyzeResponse } | { ok: false; message: string };
    let outcome: Outcome | null = null;

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drugNames: chips }),
    })
      .then(async (res) => {
        const body = await res.json();
        outcome = res.ok
          ? { ok: true, body: body as AnalyzeResponse }
          : {
              ok: false,
              message:
                res.status === 400
                  ? "الوصفة غير صالحة. تأكد من إضافة مكوّن واحد على الأقل."
                  : "تعذّر الاتصال بخدمة التحليل. تأكد إنها شغّالة وحاول مرة أخرى.",
            };
      })
      .catch(() => {
        outcome = { ok: false, message: "تعذّر الاتصال بخدمة التحليل. تأكد إنها شغّالة وحاول مرة أخرى." };
      });

    // النسبة محسوبة من الوقت المنقضي فعليًا، لا بخطوة ثابتة — هيك رحلة
    // المراحل بتاخد نفس المدة تقريبًا (~دقيقة) بغض النظر عن سرعة الشبكة،
    // وما بتقفز فجأة لـ100% أول ما يرد الباك إند (يلي برد بأقل من ثانية).
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;

      if (elapsed >= TOTAL_ANALYZING_MS && outcome) {
        if (timerRef.current) clearInterval(timerRef.current);
        setPct(100);
        const finished = outcome;
        setTimeout(() => {
          if (finished.ok) {
            setResult(finished.body);
            router.push("/report");
          } else {
            setErrorMessage(finished.message);
            setView("error");
          }
        }, 350);
        return;
      }

      setPct(Math.min(PROGRESS_CAP, Math.floor((elapsed / TOTAL_ANALYZING_MS) * 100)));
    }, 200);
  }

  function loadExample() {
    setChips(EXAMPLE_DRUGS);
    setQuery("");
    setSuggestions([]);
  }

  const stageIdx = Math.min(STAGES.length - 1, Math.floor((pct / 100) * STAGES.length));

  return (
    <section id="tool" className="scroll-mt-28 mx-auto max-w-[1000px]">
      {view === "input" && (
        <section className="pt-11 sm:pt-16">
          <h1 className="max-w-[24ch] text-[clamp(28px,3.4vw,42px)] leading-[1.32] font-semibold text-forest">
            أدخل أدوية الوصفة كاملة، ثم حلّلها كتركيبة واحدة.
          </h1>

          <div className="mt-9 rounded-3xl border border-sand/42 bg-paper p-6 shadow-[0_24px_54px_-38px_rgba(9,72,61,0.34)]">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addChip(suggestions[0]?.name ?? query);
                  }
                  if (e.key === "Escape") {
                    setQuery("");
                    setSuggestions([]);
                  }
                }}
                placeholder="اكتب اسم الدواء… مثلاً Aspirin"
                dir="rtl"
                autoComplete="off"
                className="w-full rounded-2xl border border-sand/50 bg-cream px-[18px] py-[17px] text-[17px] text-ink outline-none focus:border-teal/55"
              />

              {query.trim().length >= 2 && (
                <div className="absolute inset-x-0 top-[calc(100%+8px)] z-10 rounded-[18px] border border-sand/45 bg-paper p-2 shadow-[0_26px_50px_-28px_rgba(9,72,61,0.45)]">
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      role="button"
                      onClick={() => addChip(s.name)}
                      className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 rounded-xl p-3 hover:bg-cream"
                    >
                      <div>
                        <span dir="ltr" className="block text-right font-latin text-[15px] text-forest">
                          {s.name}
                        </span>
                        <span className="mt-1 block text-[12.5px] text-sand">
                          {s.therapeuticClass} · {s.dosage}
                        </span>
                      </div>
                      <span dir="ltr" className="font-latin text-[12.5px] text-sand">
                        {s.genericName}
                      </span>
                    </div>
                  ))}
                  <div
                    role="button"
                    onClick={() => addChip(query)}
                    className="mt-1 flex items-center justify-between gap-3 rounded-xl border-t border-sand/35 p-3 hover:bg-cream"
                  >
                    <span className="text-sm text-ink/75">
                      أضِف <span dir="ltr" className="font-latin">{query}</span> كما هو
                    </span>
                    {suggestions.length === 0 && <span className="text-[12.5px] text-amber">لا مقابل مقترح</span>}
                  </div>
                </div>
              )}
            </div>

            <p className="mt-3.5 text-sm leading-[1.85] text-ink/65">
              اكتب اسم الدواء وبتشوف اقتراحات من قاعدة الأدوية وأنت عم تكتب. المطابقة الدقيقة وفحص التفاعلات يصيرو بعد الضغط على «حلّل الوصفة».
            </p>

            {chips.length > 0 && (
              <div className="mt-[22px] flex flex-wrap gap-2 border-t border-sand/35 pt-5">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-2.5 rounded-full border border-teal/24 bg-teal/9 px-3.5 py-2.5 animate-[rise_0.45s_cubic-bezier(0.22,0.8,0.28,1)_both]"
                  >
                    <span dir="ltr" className="font-latin text-[14.5px] whitespace-nowrap text-forest">
                      {c}
                    </span>
                    <span
                      role="button"
                      onClick={() => removeChip(c)}
                      className="cursor-pointer font-latin text-[15px] text-sand hover:text-rust"
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
              <PrimaryButton onClick={run} disabled={chips.length === 0}>
                حلّل الوصفة
              </PrimaryButton>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-[13.5px] whitespace-nowrap text-sand">
                  {chips.length ? `${chips.length} مكوّن في التركيبة` : "أضف مكوّنًا واحدًا على الأقل"}
                </span>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    loadExample();
                  }}
                  className="text-[13.5px] whitespace-nowrap"
                >
                  جرّب وصفة مثال
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {view === "analyzing" && (
        <section className="pt-16 sm:pt-24">
          <Card className="p-6 sm:p-10">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[clamp(18px,2.2vw,24px)] font-semibold text-forest">{STAGES[stageIdx].label}</p>
              <span className="font-latin text-[17px] text-teal">{pct}%</span>
            </div>

            <div className="relative mt-7 h-2 overflow-hidden rounded-full bg-sand/34">
              <div
                className="absolute top-0 bottom-0 right-0 rounded-full transition-[width] duration-300 ease-linear"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg,#D89A83,#348F80)" }}
              />
            </div>

            <div className="mt-11 flex flex-wrap justify-center gap-2.5">
              {chips.map((c) => (
                <span key={c} className="inline-flex items-center gap-2.5 rounded-full border border-teal/24 bg-teal/6 px-[15px] py-2.5">
                  <span dir="ltr" className="font-latin text-[14.5px] whitespace-nowrap text-forest">
                    {c}
                  </span>
                </span>
              ))}
            </div>

            <p className="mt-14 text-center text-sm text-sand">{STAGES[stageIdx].hint}</p>
          </Card>
        </section>
      )}

      {view === "error" && (
        <section className="pt-16 sm:pt-24">
          <Card className="p-6 sm:p-10">
            <div className="flex items-start gap-3.5">
              <span className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full bg-rust" />
              <div>
                <p className="text-lg font-semibold text-forest">تعذّر إتمام التحليل</p>
                <p className="mt-2.5 text-[15.5px] leading-[1.9] text-ink/74">{errorMessage}</p>
                <div className="mt-6 flex flex-wrap items-center gap-5">
                  <PrimaryButton onClick={run}>حاول مرة أخرى</PrimaryButton>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setView("input");
                    }}
                    className="text-[15px] text-sand"
                  >
                    عدّل الوصفة
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}
    </section>
  );
}
