/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  // Keep turbopack rooted at the website dir so CSS/Tailwind resolves correctly
  turbopack: {
    root: __dirname,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
};

module.exports = nextConfig;
