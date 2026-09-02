function Bottle({
  width,
  height,
  gradient,
  shadow,
  barCount,
}: {
  width: string;
  height: string;
  gradient: string;
  shadow: string;
  barCount: 2 | 3;
}) {
  return (
    <div
      className="relative rounded-t-[7px] rounded-b-[3px]"
      style={{ width, height, background: gradient, boxShadow: shadow }}
    >
      <div
        className="absolute inset-0 rounded-t-[7px] rounded-b-[3px]"
        style={{
          background:
            "linear-gradient(100deg, rgba(255,255,255,.16) 0 14%, rgba(255,255,255,0) 42%, rgba(0,0,0,.10) 100%)",
        }}
      />
      <div
        className="absolute left-[9%] right-[9%] top-[14%] flex flex-col justify-start gap-[9%] rounded-[3px] px-[10%] pt-[11%]"
        style={{ bottom: barCount === 3 ? "34%" : "40%", background: "rgba(9,72,61,.09)" }}
      >
        <div className="h-[12%] min-h-[3px] w-[34%] rounded-sm bg-teal/85" />
        <div className="h-[8%] min-h-[2px] w-[78%] rounded-sm bg-ink/30" />
        <div className="h-[8%] min-h-[2px] w-[56%] rounded-sm bg-ink/16" />
        {barCount === 3 && (
          <div className="h-[8%] min-h-[2px] w-[66%] rounded-sm bg-ink/12" />
        )}
      </div>
    </div>
  );
}

export function HomeHeroIllustration() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-x-[6%] -inset-y-[9%] blur-[8px]"
        style={{
          background:
            "radial-gradient(55% 50% at 60% 35%, rgba(52,143,128,.14), transparent 70%), radial-gradient(45% 45% at 32% 80%, rgba(216,154,131,.18), transparent 72%)",
        }}
      />
      <div
        dir="ltr"
        className="relative aspect-4/3 w-full overflow-hidden rounded-[28px] border border-forest/18 shadow-[0_34px_70px_-32px_rgba(9,72,61,0.45)]"
        style={{
          background: "linear-gradient(158deg,#0C4A3F 0%,#2E8779 58%,#C79A85 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 46% at 42% 16%, rgba(255,255,255,.16), transparent 72%), radial-gradient(48% 40% at 82% 92%, rgba(216,154,131,.28), transparent 74%)",
          }}
        />
        <div
          className="absolute right-0 left-0 bottom-[26%] h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,.42) 18%, rgba(255,255,255,.42) 82%, transparent)",
          }}
        />

        <div className="absolute left-[12%] right-[12%] bottom-[26%] flex h-[44%] items-end justify-center gap-[4.5%]">
          <Bottle
            width="26%"
            height="66%"
            gradient="linear-gradient(160deg,#FBFAF6,#DDDCD4)"
            shadow="0 16px 26px -14px rgba(4,32,27,.5), inset 0 1px 0 rgba(255,255,255,.28)"
            barCount={2}
          />
          <Bottle
            width="30%"
            height="100%"
            gradient="linear-gradient(160deg,#FFFEFB,#E6E5DD)"
            shadow="0 22px 34px -16px rgba(4,32,27,.55), inset 0 1px 0 rgba(255,255,255,.28)"
            barCount={3}
          />
          <Bottle
            width="24%"
            height="54%"
            gradient="linear-gradient(160deg,#E9B7A2,#CE9179)"
            shadow="0 14px 24px -13px rgba(4,32,27,.45), inset 0 1px 0 rgba(255,255,255,.28)"
            barCount={2}
          />
        </div>

        <div
          className="absolute left-[12%] right-[12%] bottom-[25.4%] h-[5%] blur-[3px]"
          style={{
            background:
              "radial-gradient(ellipse at 30% 0, rgba(4,32,27,.30), transparent 62%), radial-gradient(ellipse at 52% 0, rgba(4,32,27,.34), transparent 60%), radial-gradient(ellipse at 74% 0, rgba(4,32,27,.26), transparent 62%)",
          }}
        />

        <div
          className="absolute bottom-[13%] left-1/2 grid w-[38%] -translate-x-1/2 -rotate-3 grid-cols-5 gap-[10%] rounded-lg p-[2.4%_3%]"
          style={{
            background: "linear-gradient(150deg,#FBFAF6,#E9E8E2)",
            boxShadow: "0 16px 30px -14px rgba(4,32,27,.5), inset 0 1px 0 rgba(255,255,255,.75)",
          }}
        >
          {["#4EA091", "#4EA091", "#4EA091", "#E9B7A2"].map((c, i) => (
            <div
              key={i}
              className="aspect-square rounded-full"
              style={{
                background: `linear-gradient(160deg, ${c === "#4EA091" ? "#4EA091,#2E8779" : "#E9B7A2,#CE9179"})`,
                boxShadow: `inset 0 -1px 2px rgba(0,0,0,${c === "#4EA091" ? ".18" : ".14"})`,
              }}
            />
          ))}
          <div
            className="aspect-square rounded-full"
            style={{ background: "rgba(175,184,181,.35)", boxShadow: "inset 0 1px 2px rgba(0,0,0,.10)" }}
          />
        </div>
      </div>
    </div>
  );
}
