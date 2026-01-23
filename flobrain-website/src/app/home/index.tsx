import { ApplicationsCard } from "./components/applications-card"
import { FeaturesCard } from "./components/features-card"
import { FooterBanner } from "./components/footer-banner"
import { HeroSection } from "./components/hero-section"
import { applications, features } from "./constants"

export const HomePage = () => {
    return (
        <main className="w-full h-full flex flex-col items-center">
            <HeroSection />
            <h1 className="text-[35px] font-bold">Powerful Features, Simple Integration</h1>
            <p className="text-[20px]">Everything you need to own an intelligent, context-aware virtual assistant</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[50px] mt-[50px] px-8">
                {
                    features.map(feature => (
                        <FeaturesCard {...feature} key={feature.id}/>
                    ))
                }
            </div>

            <h1 className="text-[35px] font-bold mt-[150px]">Every Where, All At Once</h1>
            <p className="text-[20px] text-center w-[60%]">FloBrain seamlessly integrates with wearables, mobile apps, web platforms, robotics, IoT devices, and enterprise systems—all through a unified API</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[50px] mt-[50px] px-8">
                {
                    applications.map(application => (
                        <ApplicationsCard {...application} key={application.id}/>
                    ))
                }
            </div>
            <FooterBanner/>
        </main>
    )
}