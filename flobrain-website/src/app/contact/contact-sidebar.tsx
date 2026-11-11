import { ExternalLink, Mail, Newspaper, Users } from "lucide-react";

const DIRECT_CONTACT_ITEMS = [
  {
    key: "support",
    icon: Mail,
    title: "Technical Support",
    description: "For users facing any problems",
    href: "mailto:support@flobrain.ai",
    email: "support@flobrain.ai",
  },
  {
    key: "partners",
    icon: Users,
    title: "Partnerships",
    description: "For device manufacturers",
    href: "mailto:hr@flobrain.ai",
    email: "hr@flobrain.ai",
  },
  {
    key: "press",
    icon: Newspaper,
    title: "Press / Media",
    description: "Media inquiries and press kit",
    href: "mailto:media@flobrain.ai",
    email: "media@flobrain.ai",
  },
] as const;

export function ContactSidebar() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h3 className="fb-contact-section-label mb-5 text-lg font-bold uppercase tracking-wider sm:mb-6 sm:text-xl">
          Direct Contact
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {DIRECT_CONTACT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.key}
                href={item.href}
                className="fb-contact-side-card group relative block rounded-xl border p-5 transition-colors duration-200 sm:p-6"
              >
                <div className="fb-contact-text-subtle absolute right-4 top-4 transition-colors group-hover:text-[var(--fb-contact-text-muted)]">
                  <ExternalLink size={16} />
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="fb-contact-icon-wrap rounded-lg p-2">
                    <Icon className="fb-contact-icon" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="fb-contact-heading mb-2 font-semibold">{item.title}</h4>
                    <p className="fb-contact-text-muted mb-3 text-sm">{item.description}</p>
                    <span className="fb-contact-link text-sm font-medium transition-colors">
                      {item.email}
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
