"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import brainImage from "@/assets/images/brain.svg";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/layout/button";

export const HeroSection = () => {
  return (
    <div className="w-full px-4 sm:px-8 md:px-16 lg:px-[120px] xl:px-[179px] py-12 sm:py-16 md:py-20 lg:py-[100px] xl:py-[150px] flex flex-col-reverse sm:flex-row items-center justify-between gap-8 sm:gap-6">
      <div className="w-full sm:w-[65%] flex flex-col justify-center text-center sm:text-left">
        <Reveal variant="slideLeft" delay={0}>
          <h1 className="text-[24px] sm:text-[28px] md:text-[32px] lg:text-[35px] text-[#CC34FF] font-bold leading-tight">
            THE INTELLIGENCE LAYER
          </h1>
        </Reveal>
        <Reveal variant="slideLeft" delay={0.08}>
          <h1 className="text-[24px] sm:text-[28px] md:text-[32px] lg:text-[35px] text-[#610081] font-bold leading-tight">
            FOR EVERY DEVICE
          </h1>
        </Reveal>
        <Reveal variant="fadeIn" delay={0.16}>
          <p className="mt-4 sm:mt-6 md:mt-[30px] w-full max-w-[490px] mx-auto sm:mx-0 text-[15px] sm:text-[17px] md:text-[19px] lg:text-[22px] text-[#FFFFFF] light:text-[#000000] leading-relaxed">
            FloBrain is the central intelligence layer that powers AI-enabled devices and
            applications. Build smarter products with workflow orchestration, persistent memory, and
            real-time AI—all privacy-first.
          </p>
        </Reveal>
        <Reveal variant="fadeIn" delay={0.24}>
          <Button
            asChild
            className="mt-[40px] self-start w-[410px] max-w-full h-11 bg-[#000000] dark:bg-[#9333EA] text-[#ffffff] hover:bg-[#111111]"
          >
            <Link href="/register">
              <span className="inline-flex w-full items-center justify-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4 text-white" />
              </span>
            </Link>
          </Button>
        </Reveal>
      </div>
      
      <Reveal variant="popUp" delay={0.12} className="flex-shrink-0">
        <Image
          src={brainImage}
          alt="FloBrain"
          width={256}
          height={233}
          className="w-[140px] sm:w-[180px] md:w-[210px] lg:w-[256px] h-auto"
        />
      </Reveal>
    </div>
  );
};
