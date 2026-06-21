"use client";

import { Zap, Layers, WifiOff, Shield } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

const FOOTER_BANNER_FEATURES = [
  { icon: Zap, label: "Real-time Sync" },
  { icon: Layers, label: "Cross-Platform" },
  { icon: WifiOff, label: "Offline Support" },
  { icon: Shield, label: "Privacy-first" },
] as const;

export const FooterBanner = () => {
  return (
<<<<<<< HEAD
    <div className="w-full my-[4px]">
      <div
        className="relative overflow-hidden rounded-[24px] flex flex-col items-center py-[36px] px-[64px] max-w-[85%] mx-auto"
        style={{ background: "var(--fb-footer-banner-bg)" }}
      >
        <h2
          className="text-[36px] font-bold text-center"
          style={{ color: "var(--fb-footer-text)" }}
        >
          One Brain, Infinite Possibilities
        </h2>
        <p
          className="mt-4 text-center text-base md:text-xl max-w-[600px]"
          style={{ color: "var(--fb-footer-subtext)" }}
        >
          Join thousands of developers building the next generation of intelligent applications
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {FOOTER_BANNER_FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-row items-center gap-2 rounded-full border border-white/40 px-4 py-2.5 dark:text-white light:border-[#6b21a8]/30 light:text-[#2d1b4e]"
            >
              <Icon className="size-4 shrink-0 text-[#A855F7]" strokeWidth={2} />
              <span className="text-sm font-medium whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>
=======
    <div className="w-full my-[4px] px-4 sm:px-6 md:px-8 pb-12 sm:pb-16 md:pb-20">
      <Reveal variant="popUp" inView className="w-full">
        <div
          className="relative overflow-hidden rounded-[16px] sm:rounded-[20px] md:rounded-[24px] flex flex-col items-center py-8 sm:py-10 md:py-[36px] px-5 sm:px-10 md:px-[64px] w-full max-w-full md:max-w-[85%] mx-auto"
          style={{
            background: "linear-gradient(135deg, #EC489940, #8B5CF640)",
          }}
        >
          <Reveal variant="fadeIn" inView delay={0.1}>
            <h2 className="text-[22px] sm:text-[28px] md:text-[32px] lg:text-[36px] font-bold text-white text-center">
              One Brain, Infinite Possibilities
            </h2>
          </Reveal>
          <Reveal variant="fadeIn" inView delay={0.16}>
            <p className="mt-3 sm:mt-4 text-center text-[#9CA3AF] text-sm sm:text-base md:text-xl max-w-[600px]">
              Join thousands of developers building the next generation of intelligent applications
            </p>
          </Reveal>
          <Stagger
            className="mt-6 sm:mt-8 md:mt-10 flex flex-wrap justify-center gap-2 sm:gap-3"
            stagger={0.06}
          >
            {FOOTER_BANNER_FEATURES.map(({ icon: Icon, label }) => (
              <StaggerItem key={label} variant="slideUp">
                <div className="flex flex-row items-center gap-2 rounded-full border border-white/40 px-3 sm:px-4 py-2 sm:py-2.5 text-white">
                  <Icon className="size-3.5 sm:size-4 shrink-0 text-[#A855F7]" strokeWidth={2} />
                  <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{label}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Reveal>
>>>>>>> origin/main
    </div>
  );
};
