import {
  Activity,
  ExternalLink,
  FileText,
  Github,
  Mail,
  MessageCircle,
  Newspaper,
  Users,
} from "lucide-react";

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

const DEVELOPER_RESOURCES = [
  {
    key: "docs",
    icon: FileText,
    title: "API Documentation",
    description: "Complete integration guides",
    iconClass: "text-purple-400",
    iconBg: "bg-purple-500/20",
  },
  {
    key: "status",
    icon: Activity,
    title: "System Status",
    description: null,
    iconClass: "text-green-400",
    iconBg: "bg-green-500/20",
    badge: "99.9% Uptime",
  },
  {
    key: "github",
    icon: Github,
    title: "GitHub",
    description: "Open source SDKs",
    iconClass: "text-purple-400",
    iconBg: "bg-purple-500/20",
  },
  {
    key: "discord",
    icon: MessageCircle,
    title: "Discord Community",
    description: "Join 5,000+ developers",
    iconClass: "text-purple-400",
    iconBg: "bg-purple-500/20",
  },
] as const;

export function ContactSidebar() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h3 className="mb-5 text-lg font-bold uppercase tracking-wider text-white sm:mb-6 sm:text-xl">
          Direct Contact
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {DIRECT_CONTACT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="group relative rounded-xl border border-white/10 bg-[#12081c]/90 p-5 shadow-xl transition-colors duration-200 hover:bg-white/10 sm:p-6"
              >
                <div className="absolute right-4 top-4 text-white/30 transition-colors group-hover:text-white/50">
                  <ExternalLink size={16} />
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="rounded-lg bg-purple-500/20 p-2">
                    <Icon className="text-purple-400" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-2 font-semibold text-white">{item.title}</h4>
                    <p className="mb-3 text-sm text-white/70">{item.description}</p>
                    <a
                      href={item.href}
                      className="text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
                    >
                      {item.email}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#12081c]/90 p-5 shadow-2xl sm:p-6 md:p-8">
        <h3 className="mb-5 text-xl font-bold uppercase tracking-wider text-white sm:mb-6 sm:text-2xl">
          Developer Resources
        </h3>

        <div className="space-y-3">
          {DEVELOPER_RESOURCES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="group flex cursor-pointer items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`rounded-lg p-2 ${item.iconBg}`}>
                    <Icon className={item.iconClass} size={18} />
                  </div>
                  <div>
                    {"badge" in item && item.badge ? (
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                        <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                          {item.badge}
                        </span>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                        {item.description && (
                          <p className="text-xs text-white/60">{item.description}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <ExternalLink
                  className="text-white/40 transition-colors group-hover:text-white/60"
                  size={16}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
