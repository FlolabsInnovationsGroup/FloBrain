import Image from "next/image";
import brainImage from "@/assets/images/brain.svg";

export const HeroSection = () => {
  return (
    <div className="w-[90%] px-[179px] py-[150px] flex flex-row items-start justify-between ">
      <div className="w-[70%] flex flex-col justify-center">
        <h1
          className="text-[35px] font-bold"
          style={{ color: "var(--fb-hero-accent)" }}
        >
          THE INTELLIGENCE LAYER
        </h1>
        <h1
          className="text-[35px] font-bold dark:text-[#610081]"
          style={{ color: "var(--fb-hero-accent-secondary)" }}
        >
          FOR EVERY DEVICE
        </h1>
        <p className="mt-[30px] w-[490px] text-[22px] leading-6 fb-text dark:text-white">
          FloBrain is the central intelligence layer that powers AI-enabled devices and
          applications. Build smarter products with workflow orchestration, persistent memory, and
          real-time AI—all privacy-first.
        </p>
      </div>
      <div>
        <Image src={brainImage} alt="FloBrain" width={256} height={233} />
      </div>
    </div>
  );
};
