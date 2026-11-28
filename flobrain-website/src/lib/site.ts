const DEFAULT_SITE_URL = "https://www.flobrain.ai";

/**
 * Canonical site origin for sitemap, robots, and metadata.
 * Deliberately ignores VERCEL_URL so canonicals never point at a per-deployment host.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configured) {
    return DEFAULT_SITE_URL;
  }

  const withProtocol = configured.startsWith("http") ? configured : `https://${configured}`;
  return withProtocol.replace(/\/$/, "");
}

export type PublicRoute = {
  path: string;
  /** ISO date of the last meaningful content change. Update when the page changes. */
  lastModified: string;
};

/** Public, indexable pages listed in the sitemap. */
export const PUBLIC_ROUTES: PublicRoute[] = [
  { path: "/", lastModified: "2026-09-02" },
  { path: "/pricing", lastModified: "2026-07-07" },
  { path: "/contact", lastModified: "2026-08-19" },
  { path: "/register", lastModified: "2026-08-24" },
];

/** Authenticated or transactional routes excluded from crawling. */
export const DISALLOWED_ROUTE_PREFIXES = [
  "/dashboard",
  "/memory",
  "/profile",
  "/settings",
  "/brain",
  "/payment",
  "/checkout",
  "/api/",
] as const;

/**
 * App-only route prefixes served with `X-Robots-Tag: noindex` (see next.config.ts).
 * They stay crawlable (not in robots.txt) so search engines can read the noindex.
 */
export const NOINDEX_ROUTE_PREFIXES = [
  "dashboard",
  "dashboardtemplates",
  "memory",
  "profile",
  "settings",
  "brain",
  "payment",
  "checkout",
  "calendar",
  "chats",
  "docs",
  "leadership",
  "leadership-preview",
  "tasks",
  "time",
  "vault",
] as const;
