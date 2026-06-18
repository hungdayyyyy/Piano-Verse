import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CTASection } from "@/components/landing/CTASection";

export const metadata: Metadata = {
  title: "PianoVerse AI — Learn Piano with AI Coaching",
  description: "Master piano with AI-powered real-time feedback, 88-key virtual piano, composition studio, and structured courses. Join 10,000+ learners today.",
  openGraph: {
    title: "PianoVerse AI — Learn Piano with AI",
    description: "Master piano with real-time AI coaching. Free plan available.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </>
  );
}
