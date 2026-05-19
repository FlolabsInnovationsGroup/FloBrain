
import { Zap, Layers, WifiOff, Shield } from "lucide-react";

const FOOTER_BANNER_FEATURES = [
  { icon: Zap, label: "Real-time Sync" },
  { icon: Layers, label: "Cross-Platform" },
  { icon: WifiOff, label: "Offline Support" },
  { icon: Shield, label: "Privacy-first" },
] as const;

export const FooterBanner = () => {
  return (
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
    </div>
  );
};
