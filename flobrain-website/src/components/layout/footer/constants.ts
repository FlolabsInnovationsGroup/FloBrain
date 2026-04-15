export const FOOTER_BRAND = "FloLabs Innovations Group" as const;

export const FOOTER_SECTIONS = [
  {
    title: "Company",
    links: [
      { label: "Careers", href: "https://www.flolabs.international/internships" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Projects",
    links: [
      { label: "CAIPO", href: "https://www.caipo.ai" },
      { label: "Mood Changer", href: "https://www.flolabsinnovations.com/moodchanger-people" },
      { label: "Flo travel", href: "https://www.flomadtravel.com" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Contact", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
] as const;

/** Replace with real FloLabs URLs when available. Env vars (e.g. NEXT_PUBLIC_LINKEDIN_URL) work here. */
export const FOOTER_SOCIAL = [
  {
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com/company/flolabs-innovation/",
    label: "FloLabs on LinkedIn",
    icon: "linkedin" as const,
    hoverClass: "hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white",
  },
] as const;

export const FOOTER_MARKETING_PATHS = ["/", "/home", "/pricing", "/contact"] as const;
