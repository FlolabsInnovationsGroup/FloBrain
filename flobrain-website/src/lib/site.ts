const DEFAULT_SITE_URL = "https://www.flobrain.ai";

/** Canonical site origin for sitemap, robots, and metadata. */
export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (!configured) {
    return DEFAULT_SITE_URL;
  }

  const withProtocol = configured.startsWith("http") ? configured : `https://${configured}`;
  return withProtocol.replace(/\/$/, "");
}

export type PublicRoute = {
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

/** Public marketing and auth entry pages indexed for search engines. */
export const PUBLIC_ROUTES: PublicRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/home", changeFrequency: "weekly", priority: 0.9 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/signin", changeFrequency: "yearly", priority: 0.4 },
  { path: "/register", changeFrequency: "yearly", priority: 0.4 },
  { path: "/forgot-password", changeFrequency: "yearly", priority: 0.3 },
];

/** Authenticated or transactional routes excluded from indexing. */
export const DISALLOWED_ROUTE_PREFIXES = [
  "/dashboard",
  "/memory",
  "/profile",
  "/settings",
  "/brain",
  "/payment",
  "/checkout",
] as const;
