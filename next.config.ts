import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Uncomment for Netlify deployment
  // output: 'standalone',
  // images: {
  //   unoptimized: true,
  // },

  // Production optimizations
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Enable strict mode for better debugging
  reactStrictMode: true,

  // Optimize for production
  swcMinify: true,
};

export default nextConfig;
