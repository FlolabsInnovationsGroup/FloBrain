import type { MetadataRoute } from "next";
import { DISALLOWED_ROUTE_PREFIXES, getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  // Keep preview deployments out of search indexes entirely.
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...DISALLOWED_ROUTE_PREFIXES],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
