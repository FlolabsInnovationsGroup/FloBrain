export const FOOTER_BRAND = "FloLabs Innovations Group" as const;

export const FOOTER_SECTIONS = [
  {
    title: "Company",
    links: [
      { label: "Careers", href: "/careers" },
      { label: "Support", href: "/support" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Projects",
    links: [
      { label: "Legal Buddy", href: "#" },
      { label: "CAIPO", href: "/home" },
      { label: "Mood Changer", href: "#" },
      { label: "Data Analytics", href: "#" },
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
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com",
    label: "FloLabs on LinkedIn",
    icon: "linkedin" as const,
    hoverClass: "hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white",
  },
  {
    href: process.env.NEXT_PUBLIC_TWITTER_URL ?? "https://twitter.com",
    label: "FloLabs on Twitter",
    icon: "twitter" as const,
    hoverClass: "hover:border-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white",
  },
  {
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com",
    label: "FloLabs on Instagram",
    icon: "instagram" as const,
    hoverClass: "hover:border-[#E1306C] hover:bg-[#E1306C] hover:text-white",
  },
] as const;

export const FOOTER_MARKETING_PATHS = ["/", "/home", "/pricing", "/contact"] as const;
