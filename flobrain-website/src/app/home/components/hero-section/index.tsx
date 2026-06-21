"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import brainImage from "@/assets/images/brain.svg";
<<<<<<< HEAD

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
=======
import { Reveal } from "@/components/motion";

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
          <p className="mt-4 sm:mt-6 md:mt-[30px] w-full max-w-[490px] mx-auto sm:mx-0 text-[15px] sm:text-[17px] md:text-[19px] lg:text-[22px] text-[#FFFFFF] leading-relaxed">
            FloBrain is the central intelligence layer that powers AI-enabled devices and
            applications. Build smarter products with workflow orchestration, persistent memory, and
            real-time AI—all privacy-first.
          </p>
        </Reveal>
>>>>>>> origin/main
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
