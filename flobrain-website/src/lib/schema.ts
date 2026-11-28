import { PLANS } from "@/app/pricing/plans";
import { getSiteUrl } from "@/lib/site";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

/** Social profiles linked in the site footer. They belong to the parent FloLabs organization. */
const PARENT_SAME_AS = [
  "https://www.youtube.com/@flolabsinnovation",
  "https://www.linkedin.com/company/flolabs-innovation/",
  "https://www.facebook.com/people/Flo-Labs-RD/61572285432918/",
  "https://www.instagram.com/flolabsinnovations/",
  "https://www.tiktok.com/@flomadlabs",
];

const ids = (site: string) => ({
  organization: `${site}/#organization`,
  website: `${site}/#website`,
  software: `${site}/#software`,
});

/** Site-wide Organization + WebSite graph, rendered in the root layout. */
export function siteSchema() {
  const site = getSiteUrl();
  const id = ids(site);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": id.organization,
        name: SITE_NAME,
        url: `${site}/`,
        logo: `${site}/apple-icon.png`,
        description: SITE_DESCRIPTION,
        parentOrganization: {
          "@type": "Organization",
          name: "FloLabs Innovations Group",
          url: "https://www.flolabsinnovations.com/",
          sameAs: PARENT_SAME_AS,
        },
        contactPoint: [
          { "@type": "ContactPoint", contactType: "customer support", email: "support@flobrain.ai" },
          { "@type": "ContactPoint", contactType: "partnerships", email: "hr@flobrain.ai" },
          { "@type": "ContactPoint", contactType: "press", email: "media@flobrain.ai" },
        ],
      },
      {
        "@type": "WebSite",
        "@id": id.website,
        url: `${site}/`,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { "@id": id.organization },
        inLanguage: "en",
      },
    ],
  };
}

/** WebPage + SoftwareApplication for the landing page. */
export function homeSchema() {
  const site = getSiteUrl();
  const id = ids(site);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${site}/#webpage`,
        url: `${site}/`,
        name: SITE_NAME,
        isPartOf: { "@id": id.website },
        about: { "@id": id.software },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        "@id": id.software,
        name: SITE_NAME,
        url: `${site}/`,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        description: SITE_DESCRIPTION,
        publisher: { "@id": id.organization },
      },
    ],
  };
}

function breadcrumb(site: string, name: string, path: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site}/` },
      { "@type": "ListItem", position: 2, name, item: `${site}${path}` },
    ],
  };
}

function parsePrice(label?: string): string | null {
  if (!label) return null;
  if (/^free$/i.test(label.trim())) return "0";
  const match = label.replace(/,/g, "").match(/^\$(\d+(?:\.\d+)?)$/);
  return match ? match[1] : null;
}

/** Pricing offers built from PLANS so the markup cannot drift from the UI. */
export function pricingSchema() {
  const site = getSiteUrl();
  const id = ids(site);
  const url = `${site}/pricing`;

  const offers = PLANS.flatMap((plan) => {
    const monthly = parsePrice(plan.monthlyPrice);
    if (monthly === null) return [];
    const result: Record<string, unknown>[] = [
      {
        "@type": "Offer",
        name: plan.name,
        description: plan.description,
        price: monthly,
        priceCurrency: "USD",
        url,
        ...(monthly !== "0"
          ? {
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: monthly,
                priceCurrency: "USD",
                billingDuration: "P1M",
                unitText: "MONTH",
              },
            }
          : {}),
      },
    ];
    const annual = parsePrice(plan.annualPrice);
    if (annual !== null) {
      result.push({
        "@type": "Offer",
        name: `${plan.name} (annual)`,
        description: plan.description,
        price: annual,
        priceCurrency: "USD",
        url,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: annual,
          priceCurrency: "USD",
          billingDuration: "P1Y",
          unitText: "YEAR",
        },
      });
    }
    return result;
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": id.software,
        name: SITE_NAME,
        url: `${site}/`,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        description: SITE_DESCRIPTION,
        publisher: { "@id": id.organization },
        offers,
      },
      breadcrumb(site, "Pricing", "/pricing"),
    ],
  };
}

/** ContactPage + breadcrumb for /contact. */
export function contactSchema() {
  const site = getSiteUrl();
  const id = ids(site);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        url: `${site}/contact`,
        name: "Contact",
        isPartOf: { "@id": id.website },
        about: { "@id": id.organization },
      },
      breadcrumb(site, "Contact", "/contact"),
    ],
  };
}
