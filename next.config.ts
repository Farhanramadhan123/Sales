import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

async function createConfig() {
  const nextPWA = (await import("@ducanh2912/next-pwa")).default;

  return nextPWA({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    disable: process.env.NODE_ENV === "development",
    workboxOptions: {
      disableDevLogs: true,
    },
  })(nextConfig);
}

export default createConfig();
