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
        <h3 className="mb-5 text-lg font-bold uppercase tracking-wider text-white sm:mb-6 sm:text-xl">
          Direct Contact
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {DIRECT_CONTACT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.key}
                href={item.href}
                className="group relative block rounded-xl border border-white/10 bg-[#12081c]/90 p-5 shadow-xl transition-colors duration-200 hover:bg-white/10 sm:p-6"
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
                    <span className="text-sm font-medium text-cyan-400 transition-colors group-hover:text-cyan-300">
                      {item.email}
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Developer Resources section removed per request */}
    </div>
  );
}
