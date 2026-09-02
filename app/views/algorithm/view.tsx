"use client";

import { useState } from "react";
import { Badge, Card } from "../../components/ui";
import { ALGOS, PIPE, type Algo } from "./data";

export function AlgorithmView() {
  const [id, setId] = useState<Algo["id"]>("fuzzy");
  const cur = ALGOS.find((a) => a.id === id) ?? ALGOS[0];
  const idx = ALGOS.indexOf(cur);
  const next = ALGOS[(idx + 1) % ALGOS.length];

  function go(target: Algo["id"]) {
    setId(target);
    document.getElementById("algorithm")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section id="algorithm" className="scroll-mt-28 mx-auto max-w-[1000px]">
      <section className="pt-10 pb-6 sm:pt-[76px] sm:pb-10">
        <a href="#how-it-works" className="text-sm text-sand">
          كيف يعمل ←
        </a>
        <div className="mt-5.5 flex flex-wrap gap-2.5">
          {ALGOS.map((a) => {
            const active = a.id === cur.id;
            return (
              <button
                key={a.id}
                onClick={() => go(a.id)}
                className="cursor-pointer rounded-xl border px-4 py-2.5 text-[14.5px]"
                style={{
                  background: active ? "rgba(52,143,128,.12)" : "#FFFEFB",
                  borderColor: active ? "rgba(52,143,128,.32)" : "rgba(175,184,181,.42)",
                  color: active ? "#09483D" : "#348F80",
                }}
              >
                {a.tab}
              </button>
            );
          })}
        </div>
        <h1 className="mt-7.5 max-w-[26ch] text-[clamp(28px,3.4vw,42px)] leading-[1.32] font-semibold tracking-[-0.01em] text-forest text-pretty">
          {cur.plainTitle}
        </h1>
        <p className="mt-3.5 text-[13.5px] text-sand">{cur.techName}</p>
        <p className="mt-5.5 max-w-[56ch] text-[16.5px] leading-[1.9] text-ink/78">{cur.intro}</p>
      </section>

      <Card className="p-6 sm:p-[30px]">
        <p className="mb-1.5 text-[15px] font-semibold text-forest">مثال محسوب</p>
        <p className="mb-4.5 text-sm text-sand">{cur.exampleCaption}</p>
        <div className="grid gap-2.5">
          {cur.rows.map((r) => {
            const isArabicHead = /[ء-ي]/.test(r.head.slice(0, 3));
            return (
              <div key={r.head} className="rounded-2xl bg-cream px-4 py-[15px]">
                <div className="flex items-center gap-3.5">
                  <span
                    dir={isArabicHead ? "rtl" : "ltr"}
                    className={`flex-1 text-right text-[15px] text-forest ${isArabicHead ? "" : "font-latin"}`}
                  >
                    {r.head}
                  </span>
                  <Badge tone={r.tone}>{r.tag}</Badge>
                </div>
                <p className="mt-2 text-sm leading-[1.8] text-ink/74">{r.note}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-4.5 text-sm leading-[1.85] text-ink/68">{cur.takeaway}</p>
      </Card>

      <Card className="mt-3.5 p-6 sm:p-[30px]">
        <p className="mb-5 text-[15px] font-semibold text-forest">موضع هذه الخطوة في المسار</p>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {PIPE.map((p, i) => {
            const on = i === cur.step;
            return (
              <div
                key={p.num}
                className="rounded-2xl border px-[17px] py-4"
                style={{ background: on ? "rgba(52,143,128,.10)" : "#F6F5F1", borderColor: on ? "rgba(52,143,128,.32)" : "transparent" }}
              >
                <p className="mb-2 font-latin text-[12.5px]" style={{ color: on ? "#348F80" : "#AFB8B5" }}>
                  {p.num}
                </p>
                <p className="text-[15px] leading-[1.6] font-medium" style={{ color: on ? "#09483D" : "rgba(9,72,61,.62)" }}>
                  {p.title}
                </p>
                <p className="mt-2 text-[13px] leading-[1.7] text-ink/60">{p.note}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-4.5 text-sm leading-[1.85] text-ink/68">{cur.pipelineNote}</p>
      </Card>

      <section className="mt-9 flex flex-wrap items-center gap-5.5 sm:mt-13">
        <a
          href="#tool"
          className="inline-flex items-center gap-3 rounded-2xl bg-teal px-8 py-4 text-[16.5px] font-medium text-cream shadow-[0_14px_30px_-18px_rgba(9,72,61,0.5)] transition-[box-shadow,transform,background] duration-300 hover:-translate-y-0.5 hover:bg-teal-dark hover:shadow-[0_16px_42px_-12px_rgba(216,154,131,0.72)]"
        >
          شوفها على وصفة حقيقية
        </a>
        <button onClick={() => go(next.id)} className="cursor-pointer text-[15px]">
          الخطوة التالية: {next.tab} ←
        </button>
      </section>
    </section>
  );
}
