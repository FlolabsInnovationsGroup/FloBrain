import { ExternalLink, Mail, Users, Newspaper } from "lucide-react";

const DIRECT_CONTACT_ITEMS = [
  {
    key: "support",
    icon: Mail,
    title: "Technical Support",
    description: "For developers integrating the SDK",
    href: "mailto:support@flolabs.ai",
    email: "support@flolabs.ai",
  },
  {
    key: "partners",
    icon: Users,
    title: "Partnerships",
    description: "For device manufacturers",
    href: "mailto:partners@flolabs.ai",
    email: "partners@flolabs.ai",
  },
  {
    key: "press",
    icon: Newspaper,
    title: "Press / Media",
    description: "Media inquiries and press kit",
    href: "mailto:press@flolabs.ai",
    email: "press@flolabs.ai",
  },
] as const;

export const DirectContact = () => {
  return (
    <div>
      <h3 className="fb-contact-section-label text-xl font-bold mb-6 uppercase tracking-wider">
        Direct Contact
      </h3>
      <div className="space-y-4">
        {DIRECT_CONTACT_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.key}
              href={item.href}
              className="fb-contact-side-card group relative block rounded-xl border p-6 transition-colors duration-200"
            >
              <div className="fb-contact-text-subtle absolute top-4 right-4 transition-colors group-hover:text-[var(--fb-contact-text-muted)]">
                <ExternalLink size={16} />
              </div>
              <div className="flex items-start gap-4">
                <div className="fb-contact-icon-wrap p-2 rounded-lg">
                  <Icon className="fb-contact-icon" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="fb-contact-heading font-semibold mb-2">{item.title}</h4>
                  <p className="fb-contact-text-muted text-sm mb-3">{item.description}</p>
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
  );
};
