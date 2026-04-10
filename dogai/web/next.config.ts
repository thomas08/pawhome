import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "photos.maker-hub.net",
      },
    ],
    unoptimized: true,
  },
  webpack(config, { nextRuntime }) {
    // Enable WASM support (needed for @prisma/client/wasm in Node.js dev mode)
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // In local dev (development), alias /wasm to regular client
    // so Prisma doesn't try to load native .wasm files through the Node.js ESM loader.
    // CF Workers build (production) keeps the real WASM import.
    if (process.env.NODE_ENV === "development") {
      const alias = (config.resolve?.alias ?? {}) as Record<string, string>;
      alias["@prisma/client/wasm"] = require.resolve("@prisma/client");
      if (config.resolve) config.resolve.alias = alias;
    }

    return config;
  },
};

export default nextConfig;
