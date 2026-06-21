"use client";

import { ApplicationsCard } from "./components/applications-card";
import { FeaturesCard } from "./components/features-card";
import { FooterBanner } from "./components/footer-banner";
import { HeroSection } from "./components/hero-section";
import { applications, features } from "./constants";
import { MotionProvider, Reveal, Stagger, StaggerItem } from "@/components/motion";
/**
 * It is rendered at the root "/" when userLogged is false.
 */
export default function HomePage() {
  return (
    <MotionProvider>
      <main className="w-full h-full flex flex-col items-center">
        <HeroSection />

        <div className="w-full max-w-7xl px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
          <Reveal variant="fadeIn" inView>
            <h1 className="text-[22px] sm:text-[28px] md:text-[32px] lg:text-[36px] font-bold text-center mb-3 sm:mb-4 text-[#FFFFFF]">
              Powerful Features, Simple Integration
            </h1>
          </Reveal>
          <Reveal variant="fadeIn" inView delay={0.06}>
            <p className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-regular text-center text-zinc-400 mb-10 sm:mb-16 md:mb-20 lg:mb-28 max-w-[90%] sm:max-w-[80%] mx-auto">
              Everything you need to build intelligent, context-aware applications
            </p>
          </Reveal>

          <Stagger
            className="grid grid-cols-2 md:grid-cols-3 auto-rows-fr gap-3 sm:gap-6 md:gap-8 lg:gap-[50px] mt-6 sm:mt-8 md:mt-[50px]"
            stagger={0.08}
          >
            {features.map((feature) => (
              <StaggerItem key={feature.id} variant="slideUp">
                <FeaturesCard {...feature} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <div className="w-full max-w-7xl px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
          <Reveal variant="slideUp" inView>
            <h1 className="text-[22px] sm:text-[28px] md:text-[32px] lg:text-[35px] font-bold text-center mb-3 sm:mb-4 text-[#FFFFFF]">
              Every Where, All At Once
            </h1>
          </Reveal>
          <Reveal variant="fadeIn" inView delay={0.06}>
            <p className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] text-center text-zinc-400 mx-auto w-[90%] sm:w-[80%] md:w-[70%] lg:w-[60%] mb-10 sm:mb-16 md:mb-20 lg:mb-28">
              FloBrain seamlessly integrates with wearables, mobile apps, web platforms, robotics,
              IoT devices, and enterprise systems—all through a unified API
            </p>
          </Reveal>

          <Stagger
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-[50px] mt-6 sm:mt-8 md:mt-[80px]"
            stagger={0.1}
          >
            {applications.map((application, index) => (
              <StaggerItem
                key={application.id}
                variant={index % 2 === 0 ? "slideLeft" : "slideRight"}
              >
                <ApplicationsCard {...application} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <FooterBanner />
      </main>
    </MotionProvider>
  );
}
