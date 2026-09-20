import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '/api/contributions': ['./src/DATA.md', './src/DATA.json', './data/*.ts', './data/europa/*.ts', './data/london/*.ts'],
    '/api/contributions/entries': ['./src/DATA.md', './src/DATA.json', './data/*.ts', './data/europa/*.ts', './data/london/*.ts'],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdnjs.cloudflare.com',
      },
    ],
  },
};

export default nextConfig;
