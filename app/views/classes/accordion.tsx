"use client";

import { useState } from "react";

type Med = { id: number; name: string; genericName: string };

export function ClassesAccordion({ classes }: { classes: [string, Med[]][] }) {
  const [open, setOpen] = useState<string | null>(classes[0]?.[0] ?? null);

  return (
    <section className="grid gap-2.5">
      {classes.map(([className, meds]) => {
        const isOpen = open === className;
        return (
          <div
            key={className}
            className="overflow-hidden rounded-[20px] border border-sand/42 bg-paper shadow-[0_20px_46px_-38px_rgba(9,72,61,0.32)]"
          >
            <div
              role="button"
              onClick={() => setOpen(isOpen ? null : className)}
              className="flex cursor-pointer items-center gap-4 px-6 py-5"
            >
              <span dir="ltr" className="flex-1 text-right font-latin text-[16px] font-medium text-forest">
                {className}
              </span>
              <span className="rounded-lg bg-teal/12 px-2.5 py-1 font-latin text-[12.5px] text-teal">{meds.length}</span>
              <span className="w-4 text-center font-latin text-[19px] text-teal">{isOpen ? "−" : "+"}</span>
            </div>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="grid gap-1.5 px-6 pb-5.5 sm:grid-cols-2">
                  {meds.map((m) => (
                    <div
                      key={m.id}
                      dir="ltr"
                      className="flex items-center justify-between gap-3 rounded-xl bg-cream px-3.5 py-2.5"
                    >
                      <span className="font-latin text-[14px] text-forest">{m.name}</span>
                      <span className="font-latin text-[12px] text-sand">{m.genericName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
