import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { SubjectShowcase } from "@/components/landing/SubjectShowcase";
import { GamificationSection } from "@/components/landing/GamificationSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main id="progress">
        <Hero />
        <FeatureGrid />
        <SubjectShowcase />
        <GamificationSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
