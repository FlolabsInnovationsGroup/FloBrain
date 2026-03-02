import Link from "next/link";
import { Zap, Layers, WifiOff, Shield, ArrowRight } from "lucide-react";

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
        style={{
          background:
          "linear-gradient(135deg, #EC489940, #8B5CF640)",
        }}
      >
        <h2 className="text-[36px] font-bold text-white text-center">
          One Brain, Infinite Possibilities
        </h2>
        <p className="mt-4 text-center text-[#9CA3AF] text-base md:text-xl max-w-[600px]">
          Join thousands of developers building the next generation of intelligent applications
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {FOOTER_BANNER_FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-row items-center gap-2 rounded-full border border-white/40 px-4 py-2.5 text-white"
            >
              <Icon className="size-4 shrink-0 text-[#A855F7]" strokeWidth={2} />
              <span className="text-sm font-medium whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
        <Link
          href="/register"
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-xl bg-[#A855F7] px-8 py-4 text-white font-semibold text-base hover:bg-[#7C3AED] transition-colors"
        style={{
          boxShadow:
            "0 2px 30px rgba(169, 85, 247, 0.59) ",
        }}>
          Create Free Account
          <ArrowRight className="size-5 shrink-0" />
        </Link>
        <p className="mt-6 text-center text-sm text-white/70 font-light">
          No credit card required • Free tier includes 10K tokens/month
        </p>
      </div>
    </div>
  );
};
