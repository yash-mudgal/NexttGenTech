import Hero from "@/sections/Hero/Hero";
import TechMarquee from "@/sections/Marquee/TechMarquee";
import Solutions from "@/sections/Solutions/Solutions";
import ErpEcosystem from "@/sections/Ecosystem/ErpEcosystem";
import AISection from "@/sections/AI/AISection";
import AIUseCases from "@/sections/AI/AIUseCases";
import AIWorkflow from "@/sections/AI/AIWorkflow";
import Technologies from "@/sections/Technologies/Technologies";
import DatabaseSection from "@/sections/Database/DatabaseSection";
import CloudSection from "@/sections/Cloud/CloudSection";
import Services from "@/sections/Services/Services";
import Industries from "@/sections/Industries/Industries";
import WhyNextGen from "@/sections/Why/WhyNextGen";
import Process from "@/sections/Process/Process";
import DeveloperCulture from "@/sections/Culture/DeveloperCulture";
import Leadership from "@/sections/Leadership/Leadership";
import About from "@/sections/About/About";
import Metrics from "@/sections/Metrics/Metrics";
import CTASection from "@/sections/CTA/CTASection";
import Contact from "@/sections/Contact/Contact";

/**
 * The full single-page experience.
 *
 * Order matters: it walks a visitor from "what we build" → "the products" →
 * "how they connect" → "the intelligence and engineering behind them" →
 * "who we are" → "let's talk".
 */
export function Home() {
  return (
    <>
      {/* — What we do ————————————————————————————————— */}
      <Hero />
      <TechMarquee />

      {/* — What we build ————————————————————————————— */}
      <Solutions />
      <ErpEcosystem />

      {/* — The intelligence layer ————————————————————— */}
      <AISection />
      <AIUseCases />
      <AIWorkflow />

      {/* — How we build it ——————————————————————————— */}
      <Technologies />
      <DatabaseSection />
      <CloudSection />
      <Services />

      {/* — Who it's for ——————————————————————————————— */}
      <Industries />
      <WhyNextGen />
      <Process />
      <DeveloperCulture />

      {/* — Who we are ————————————————————————————————— */}
      <Leadership />
      <About />
      <Metrics />

      {/* — Let's talk ————————————————————————————————— */}
      <CTASection />
      <Contact />
    </>
  );
}

export default Home;
