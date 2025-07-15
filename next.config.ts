import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flsu53ntc8dvexn0.public.blob.vercel-storage.com',
        port: '',
        pathname: '/drivers/**',
      },
    ],
  },
};

export default nextConfig;
