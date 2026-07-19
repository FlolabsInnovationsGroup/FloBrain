import Image from "next/image";
import brainImage from "@/assets/images/brain.svg";

export const HeroSection = () => {
  return (
    <div className="w-full px-4 sm:px-8 md:px-16 lg:px-[120px] xl:px-[179px] py-12 sm:py-16 md:py-20 lg:py-[100px] xl:py-[150px] flex flex-col-reverse sm:flex-row items-center justify-between gap-8 sm:gap-6">
      <div className="w-full sm:w-[65%] flex flex-col justify-center text-center sm:text-left">
        <h1 className="text-[24px] sm:text-[28px] md:text-[32px] lg:text-[35px] text-[#CC34FF] font-bold leading-tight">
          THE INTELLIGENCE LAYER
        </h1>
        <h1 className="text-[24px] sm:text-[28px] md:text-[32px] lg:text-[35px] text-[#610081] font-bold leading-tight">
          FOR EVERY DEVICE
        </h1>
        <p className="mt-4 sm:mt-6 md:mt-[30px] w-full max-w-[490px] mx-auto sm:mx-0 text-[15px] sm:text-[17px] md:text-[19px] lg:text-[22px] text-[#FFFFFF] leading-relaxed">
          FloBrain is the AI operating system for memory, model routing, and
            multi-agent workflows.
        </p>
      </div>
      <div className="flex-shrink-0">
        <Image
          src={brainImage}
          alt="FloBrain"
          width={256}
          height={233}
          className="w-[140px] sm:w-[180px] md:w-[210px] lg:w-[256px] h-auto"
        />
      </div>
    </div>
  );
};
