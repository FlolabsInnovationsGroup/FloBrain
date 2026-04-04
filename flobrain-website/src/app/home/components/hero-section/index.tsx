import Image from "next/image";
import brainImage from "@/assets/images/brain.svg";
export const HeroSection = () => {
  return (
    <div className="w-[90%] px-[179px] py-[150px] flex flex-row items-start justify-between ">
      <div className="w-[70%] flex flex-col justify-center">
        <h1 className="text-[35px] text-[#CC34FF] font-bold">THE INTELLIGENCE LAYER</h1>
        <h1 className="text-[35px] text-[#610081] font-bold">FOR EVERY DEVICE</h1>
        <p className="mt-[30px] w-[490px] text-[22px] text-[#FFFFFF] leading-6">
          FloBrain is the central intelligence layer that powers AI-enabled devices and
          applications. Build smarter products with workflow orchestration, persistent memory, and
          real-time AI—all privacy-first.
        </p>
        {/* <button className="py-7 rounded-[16px] bg-[#A855F7] text-white font-semibold text-[20px] flex flex-row items-center justify-center gap-2 w-50 h-16 mt-[50px] cursor-pointer"
        style={{
          boxShadow:
            "0 2px 30px rgba(169, 85, 247, 0.59) ",
        }}>
          Get started
          <ArrowRight />
        </button> */}
      </div>
      <div>
        <Image src={brainImage} alt="FloBrain" width={256} height={233} />
      </div>
    </div>
  );
};
