import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces .next/standalone so the site can be uploaded to cPanel without node_modules.
  output: "standalone",
  experimental: {
    // CV uploads are capped at 5 MB; leave room for multipart overhead.
    serverActions: { bodySizeLimit: "6mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
