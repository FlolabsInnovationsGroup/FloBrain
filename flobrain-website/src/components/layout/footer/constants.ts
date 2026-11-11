export const FOOTER_BRAND = "FloBrain" as const;
export const FOOTER_BYLINE = "by FloLabs Innovations Group" as const;
export const FOOTER_DESCRIPTION =
  "FloBrain is the intelligence layer for AI-enabled devices and apps. Build smarter products with workflow orchestration, persistent memory, and privacy-first AI." as const;

export type FooterLinkItem = {
  href: string;
  label: string;
  external?: boolean;
};

export const FOOTER_NAVIGATION_LINKS: FooterLinkItem[] = [
  { href: "/home", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export const FOOTER_PROJECT_LINKS: FooterLinkItem[] = [
  {
    href: "https://www.athleticperformanceintelligence.com/",
    label: "Athletic Performance Intelligence",
    external: true,
  },
  { href: "https://www.caipo.ai/", label: "CAIPO", external: true },
  {
    href: "https://www.youtube.com/@flolabsinnovation",
    label: "Connecting the Dots",
    external: true,
  },
  {
    href: "http://cosmosintelligence.org/",
    label: "Cosmos Intelligence",
    external: true,
  },
  { href: "https://www.flomadtravel.com/", label: "Flo Travel", external: true },
  {
    href: "https://www.flolabsinnovations.com/",
    label: "FloLabs Innovations Group",
    external: true,
  },
  {
    href: "https://www.flolabs.international/",
    label: "FloLabs International",
    external: true,
  },
  { href: "https://www.flostudios.ai/", label: "FloStudios", external: true },
  {
    href: "https://hephaestus.international/",
    label: "Hepheastus International",
    external: true,
  },
  {
    href: "https://www.bootcampuniversity.org/",
    label: "Innovation Bootcamp University",
    external: true,
  },
  {
    href: "https://www.legalethicsventuresinstitute.com/",
    label: "Legal & Ethics Ventures Institute",
    external: true,
  },
  { href: "https://www.moodchanger.ai/", label: "MoodChanger", external: true },
  {
    href: "https://www.robocollective.ai/",
    label: "RoboCollective",
    external: true,
  },
  {
    href: "https://www.spaceventuresinstitute.com/",
    label: "Space Ventures Institute",
    external: true,
  },
  { href: "https://tarrl.org/", label: "TARRL", external: true },
];

export const FOOTER_COMPANY_LINKS: FooterLinkItem[] = [
  {
    href: "https://www.flolabs.international/internships",
    label: "Careers",
    external: true,
  },
  { href: "mailto:support@flolabs.ai", label: "Contact Us" },
  {
    href: "https://flolabsrd.notion.site/merch-background",
    label: "Merch",
    external: true,
  },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
];

/** Env vars (e.g. NEXT_PUBLIC_LINKEDIN_URL) work here. */
export const FOOTER_SOCIAL = [
  {
    href:
      process.env.NEXT_PUBLIC_YOUTUBE_URL ??
      "https://www.youtube.com/@flolabsinnovation",
    label: "YouTube",
    icon: "youtube" as const,
  },
  {
    href:
      process.env.NEXT_PUBLIC_LINKEDIN_URL ??
      "https://www.linkedin.com/company/flolabs-innovation/",
    label: "LinkedIn",
    icon: "linkedin" as const,
  },
  {
    href: "https://www.facebook.com/people/Flo-Labs-RD/61572285432918/",
    label: "Facebook",
    icon: "facebook" as const,
  },
  {
    href: "https://www.instagram.com/flolabsinnovations/",
    label: "Instagram",
    icon: "instagram" as const,
  },
  {
    href: "https://www.tiktok.com/@flomadlabs",
    label: "TikTok",
    icon: "tiktok" as const,
  },
  {
    href: "https://www.reddit.com/user/FloLabs_Innovations/",
    label: "Reddit",
    icon: "reddit" as const,
  },
];

export const FOOTER_MARKETING_PATHS = ["/", "/home", "/pricing", "/contact"] as const;
