"use client";

import { useState } from "react";
import { Eyebrow } from "../../components/ui";
import { QA } from "./data";

export function FaqView() {
  const [open, setOpen] = useState<number[]>([0]);

  function toggle(i: number) {
    setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : o.concat([i])));
  }

  return (
    <section id="faq" className="scroll-mt-28 mx-auto max-w-[820px]">
      <section className="pt-10 pb-7 sm:pt-20 sm:pb-11">
        <Eyebrow>أسئلة شائعة</Eyebrow>
        <h1 className="max-w-[22ch] text-[clamp(30px,3.6vw,44px)] leading-[1.32] font-semibold tracking-[-0.01em] text-forest text-pretty">
          ما تفعله الأداة، وما لا تفعله
        </h1>
      </section>

      <section className="grid gap-2.5">
        {QA.map((item, i) => {
          const isOpen = open.includes(i);
          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-[20px] border border-sand/42 bg-paper shadow-[0_20px_46px_-38px_rgba(9,72,61,0.32)]"
            >
              <div role="button" onClick={() => toggle(i)} className="flex cursor-pointer items-center gap-4 px-6 py-5">
                <span className="flex-1 text-[17px] leading-[1.6] font-medium text-forest">{item.q}</span>
                <span
                  className="w-4 text-center font-latin text-[19px] text-teal transition-transform duration-300 ease-out"
                  style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                >
                  {isOpen ? "−" : "+"}
                </span>
              </div>
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5.5 text-base leading-[1.95] text-ink/78 text-pretty">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-sand/40 pt-7.5 sm:mt-16 sm:pt-11.5">
        <p className="text-base text-ink/76">سؤال غير موجود هنا؟</p>
        <a href="#contact" className="text-[15px]">
          اكتب لنا ←
        </a>
      </section>
    </section>
  );
}
