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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
