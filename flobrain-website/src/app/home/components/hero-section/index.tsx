import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import brainImage from "@/assets/images/brain.svg";

export const HeroSection = () => {
  return (
    <div className="w-[90%] flex flex-row items-start justify-between px-[179px] py-[150px]">
      <div className="w-[70%] flex flex-col justify-center">
        <h1
          className="text-[35px] font-bold uppercase tracking-tight"
          style={{ color: "var(--fb-hero-accent)" }}
        >
          THE INTELLIGENCE LAYER
        </h1>
        <h1
          className="text-[35px] font-bold uppercase tracking-tight dark:text-[#610081]"
          style={{ color: "var(--fb-hero-accent-secondary)" }}
        >
          FOR EVERY DEVICE
        </h1>
        <p
          className="mt-[30px] w-[490px] text-[22px] leading-7 dark:text-white"
          style={{ color: "var(--fb-hero-body, var(--fb-text))" }}
        >
          FloBrain is the central intelligence layer that powers AI-enabled devices and
          applications. Build smarter products with workflow orchestration, persistent memory, and
          real-time AI—all privacy-first.
        </p>
        <Link
          href="/register"
          className="fb-hero-cta mt-10 inline-flex w-fit items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold shadow-md transition-colors"
        >
          Get started
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
      <div>
        <Image src={brainImage} alt="FloBrain" width={256} height={233} priority />
      </div>
    </div>
  );
};
