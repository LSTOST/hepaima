"use client";

import {
  Navbar,
  Hero,
  StageSelector,
  TrustSection,
  ReportPreview,
  BottomCTA,
  Footer,
} from "@/components/home";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Stage Selection Cards */}
      <StageSelector />

      {/* Scientific Backing */}
      <TrustSection />

      {/* Report Preview */}
      <ReportPreview />

      {/* Bottom CTA */}
      <BottomCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}
