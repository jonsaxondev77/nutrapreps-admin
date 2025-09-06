import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add this new configuration section
  serverRuntimeConfig: {
    apiUrl: process.env.API_URL,
  },
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/150/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      }, 
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**'
      }, 
      {
        protocol: 'https',
        hostname: 'nutrapreps.b-cdn.net', 
        port: '',
        pathname: '/**',
      }
    ]
  }
};

export default nextConfig;