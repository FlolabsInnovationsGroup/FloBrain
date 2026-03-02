"use client";

import { ApplicationsCard } from "./components/applications-card";
import { FeaturesCard } from "./components/features-card";
import { FooterBanner } from "./components/footer-banner";
import { HeroSection } from "./components/hero-section";
import { applications, features } from "./constants";

/**
 * It is rendered at the root "/" when userLogged is false.
 */
export default function HomePage() {
  return (
    <main className="w-full h-full flex flex-col items-center">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Features Grid */}
      <div className="w-full max-w-7xl px-4 py-20">
        <h1 className="text-[36px] font-bold text-center mb-4 text-[#FFFFFF]">
          Powerful Features, Simple Integration
        </h1>
        <p className="text-[20px] font-regular text-center text-zinc-400 mb-28">
        Everything you need to build intelligent, context-aware applications
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[50px] mt-[50px]">
          {features.map((feature) => (
            <FeaturesCard {...feature} key={feature.id} />
          ))}
        </div>
      </div>

      {/* 3. Applications / Ecosystem Section */}
      <div className="w-full max-w-7xl px-4 py-20">
        <h1 className="text-[35px] font-bold text-center mb-4 text-[#FFFFFF]">
          Every Where, All At Once
        </h1>
        <p className="text-[20px] text-center text-zinc-400 mx-auto w-[80%] md:w-[60%] mb-28">
          FloBrain seamlessly integrates with wearables, mobile apps, web platforms, robotics, IoT
          devices, and enterprise systems—all through a unified API
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[50px] mt-[80px]">
          {applications.map((application) => (
            <ApplicationsCard {...application} key={application.id} />
          ))}
        </div>
      </div>

      {/* 4. Footer Call to Action */}
      <FooterBanner />
    </main>
  );
}
