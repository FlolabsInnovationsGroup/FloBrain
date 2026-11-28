import type { MetadataRoute } from "next";
import { getSiteUrl, PUBLIC_ROUTES } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return PUBLIC_ROUTES.map(({ path, lastModified }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
  }));
}
