"use client";

import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";

import { useLiveStats } from "./welcome/useLiveStats";
import { HeroSection } from "./welcome/HeroSection";
import { FeaturesSection } from "./welcome/FeaturesSection";
import { HowItWorksSection } from "./welcome/HowItWorksSection";
import { StatsSection } from "./welcome/StatsSection";
import { WhySection } from "./welcome/WhySection";
import { CtaSection } from "./welcome/CtaSection";

export function WelcomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const liveStats = useLiveStats();

  // Parallax for the hero aurora
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 700], [1, 0]);
  const heroY = useTransform(scrollY, [0, 700], [0, -50]);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.9,
      behavior: "smooth",
    });
  };

  return (
    <div ref={containerRef} className="bg-black text-white relative">
      <HeroSection
        heroOpacity={heroOpacity}
        heroY={heroY}
        liveStats={liveStats}
        scrollToContent={scrollToContent}
      />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection liveStats={liveStats} />
      <WhySection />
      <CtaSection />
    </div>
  );
}
