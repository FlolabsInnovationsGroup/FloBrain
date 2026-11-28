import type { NextConfig } from "next";
import path from "path";
import { withSentryConfig } from "@sentry/nextjs";
import { NOINDEX_ROUTE_PREFIXES } from "./src/lib/site";

const nextConfig: NextConfig = {
  async headers() {
    // App screens are not search landing pages: tell crawlers not to index them.
    return [
      {
        source: `/:section(${NOINDEX_ROUTE_PREFIXES.join("|")})/:path*`,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(process.cwd(), "src"),
    };
    return config;
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
