import { HomeHeroIllustration } from "../../components/home-hero-illustration";
import { PrimaryButton } from "../../components/ui";

export function HomeView() {
  return (
    <section id="top" className="scroll-mt-28">
      <div className="mx-auto max-w-[1240px]">
        <div
          className="mt-7 grid items-center gap-10 rounded-[34px] border border-teal/14 px-6 py-12 sm:py-16 md:grid-cols-2 md:gap-16 lg:gap-24 lg:px-14 lg:py-[92px] shadow-[0_30px_70px_-46px_rgba(9,72,61,0.35)]"
          style={{
            background:
              "radial-gradient(70% 60% at 88% 8%, rgba(52,143,128,.14), transparent 68%), radial-gradient(62% 55% at 6% 96%, rgba(216,154,131,.16), transparent 70%), linear-gradient(160deg, rgba(255,254,251,.86), rgba(246,245,241,.62))",
          }}
        >
          <div className="animate-[rise_0.7s_cubic-bezier(0.22,0.8,0.28,1)_both]">
            <h1 className="max-w-[20ch] text-[clamp(36px,4.4vw,60px)] leading-[1.28] font-semibold tracking-[-0.01em] text-forest text-pretty">
              الوصفة تُجدَّد كاملة، كتركيبة واحدة.
            </h1>
            <p className="mt-7 max-w-[40ch] text-[clamp(16px,1.3vw,18.5px)] leading-[1.9] text-ink/78 text-pretty">
              فحص للتفاعلات، ترتيب للبدائل عند نقص التوفّر، وشرح واضح لكل اقتراح.
            </p>
            <div className="mt-11 flex flex-wrap items-center gap-4">
              <PrimaryButton href="#tool">جرّب الأداة</PrimaryButton>
              <a href="#how-it-works" className="text-[14.5px] whitespace-nowrap text-teal hover:text-terracotta">
                كيف يعمل التحليل ←
              </a>
            </div>
          </div>

          <div className="animate-[rise_0.9s_0.1s_cubic-bezier(0.22,0.8,0.28,1)_both]">
            <HomeHeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
