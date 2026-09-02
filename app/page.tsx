import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import { HomeView } from "./views/home/view";
import { ToolView } from "./views/tool/view";
import { QuickStartView } from "./views/quick-start/view";
import { HowItWorksView } from "./views/how-it-works/view";
import { BeforeAfterView } from "./views/before-after/view";
import { AlgorithmView } from "./views/algorithm/view";
import { ClassesView } from "./views/classes/view";
import { AboutView } from "./views/about/view";
import { StatsView } from "./views/stats/view";
import { FaqView } from "./views/faq/view";
import { TestimonialsView } from "./views/testimonials/view";
import { ContactView } from "./views/contact/view";

export default function Home() {
  return (
    <div className="box-border min-h-screen px-5 pt-24 pb-24 sm:px-8 sm:pt-28 lg:px-10 xl:px-14">
      <SiteHeader />

      <main className="flex flex-col gap-16 sm:gap-20">
        <HomeView />
        <ToolView />
        <QuickStartView />
        <HowItWorksView />
        <BeforeAfterView />
        <AlgorithmView />
        <ClassesView />
        <AboutView />
        <StatsView />
        <FaqView />
        <TestimonialsView />
        <ContactView />
      </main>

      <SiteFooter />
    </div>
  );
}
