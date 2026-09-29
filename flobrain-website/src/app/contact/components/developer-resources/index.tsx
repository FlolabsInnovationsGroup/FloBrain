import { ExternalLink, FileText, Activity, Github, MessageCircle } from "lucide-react";

const RESOURCES = [
  {
    key: "docs",
    icon: FileText,
    iconClass: "fb-contact-icon",
    title: "API Documentation",
    description: "Complete integration guides",
  },
  {
    key: "status",
    icon: Activity,
    iconClass: "text-green-400",
    iconWrapClass: "bg-green-500/20",
    title: "System Status",
    description: null,
    badge: "99.9% Uptime",
  },
  {
    key: "github",
    icon: Github,
    iconClass: "fb-contact-icon",
    title: "GitHub",
    description: "Open source SDKs",
  },
  {
    key: "discord",
    icon: MessageCircle,
    iconClass: "fb-contact-icon",
    title: "Discord Community",
    description: "Join 5,000+ developers",
  },
] as const;

export const DeveloperResources = () => {
  return (
    <div className="fb-contact-side-card rounded-2xl border p-8">
      <h3 className="fb-contact-section-label text-2xl font-bold mb-6 uppercase tracking-wider">
        Developer Resources
      </h3>

      <div className="space-y-3">
        {RESOURCES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="fb-contact-form-card flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors hover:bg-[var(--fb-contact-card-hover)]"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`rounded-lg p-2 ${"iconWrapClass" in item && item.iconWrapClass ? item.iconWrapClass : "fb-contact-icon-wrap"}`}
                >
                  <Icon className={item.iconClass} size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="fb-contact-heading text-sm font-semibold">{item.title}</h4>
                    {"badge" in item && item.badge ? (
                      <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  {item.description ? (
                    <p className="fb-contact-text-muted text-xs">{item.description}</p>
                  ) : null}
                </div>
              </div>
              <ExternalLink
                className="fb-contact-text-subtle transition-colors group-hover:text-[var(--fb-contact-text-muted)]"
                size={16}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
