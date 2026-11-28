import type { Metadata } from "next";

export const SITE_NAME = "FloBrain";
export const SITE_TAGLINE = "The Intelligence Layer for AI-Enabled Devices and Apps";
export const SITE_DESCRIPTION =
  "FloBrain is the intelligence layer for AI-enabled devices and apps. Build smarter products with workflow orchestration, persistent memory, and privacy-first AI.";

type PageMetadataInput = {
  /** Route path, e.g. "/pricing". Used for the canonical and og:url. */
  path: string;
  /** Page title. Rendered through the root "%s | FloBrain" template unless `absoluteTitle` is set. */
  title: string;
  description: string;
  absoluteTitle?: boolean;
  robots?: Metadata["robots"];
};

/**
 * Builds per-page metadata with a canonical URL and matching Open Graph / Twitter tags.
 * Next.js merges nested `openGraph` objects shallowly, so each page sets the full object.
 */
export function buildPageMetadata({
  path,
  title,
  description,
  absoluteTitle = false,
  robots,
}: PageMetadataInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  // A noindex page should not also declare itself canonical (mixed signal).
  const indexable = !(robots && typeof robots === "object" && robots.index === false);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(indexable ? { alternates: { canonical: path } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    ...(robots ? { robots } : {}),
  };
}
