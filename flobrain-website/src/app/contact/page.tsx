<<<<<<< HEAD
import { ContactHero } from "./components/contact-hero";
import { ContactForm } from "./components/contact-form";
import { DirectContact } from "./components/direct-contact";
import { DeveloperResources } from "./components/developer-resources";

export default function Contact() {
  return (
    <div className="min-h-screen relative fb-page">
      <ContactHero />

      <main className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-8">
              <ContactForm />
            </div>

            <div className="space-y-8">
              <DirectContact />
              <DeveloperResources />
=======
import "./contact.css";
import { ContactForm } from "./contact-form";
import { ContactSidebar } from "./contact-sidebar";

export default function Contact() {
  return (
    <div className="contact-page relative min-h-screen">
      <section className="relative z-10 pt-12 pb-10 sm:pt-16 sm:pb-12 md:pt-20 md:pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="contact-hero-title mb-4 text-[22px] font-bold leading-tight text-white sm:text-[28px] md:text-[32px] lg:text-[36px]">
            Scale Your AI Intelligence
          </h1>
          <p className="contact-hero-desc max-w-[90%] text-sm leading-relaxed text-white/70 sm:max-w-[80%] sm:text-base md:max-w-[70%] md:text-lg lg:max-w-[60%] lg:text-xl">
            Connect with our engineering team to integrate FloLabs Brain into your workflow, or
            reach out to sales for enterprise solutions and partnerships.
          </p>
        </div>
      </section>

      <main className="relative z-10 pb-16 sm:pb-20 md:pb-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="contact-col-left">
              <ContactForm />
            </div>
            <div className="contact-col-right">
              <ContactSidebar />
>>>>>>> origin/main
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
