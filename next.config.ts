import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', 'http://192.168.29.120'],
  images: {
    minimumCacheTTL: 60*60*24*365,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d127ve4h29yx4k.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
