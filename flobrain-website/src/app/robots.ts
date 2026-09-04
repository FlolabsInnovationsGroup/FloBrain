import type { MetadataRoute } from "next";
import { DISALLOWED_ROUTE_PREFIXES, getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...DISALLOWED_ROUTE_PREFIXES],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
