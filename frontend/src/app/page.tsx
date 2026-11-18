import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhatWeAnalyze } from "@/components/landing/WhatWeAnalyze";
import { PrivacyNote } from "@/components/landing/PrivacyNote";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <WhatWeAnalyze />
        <PrivacyNote />
      </main>
      <Footer />
    </div>
  );
}
