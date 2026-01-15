import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Not needed for Vercel - supports full Next.js features
  trailingSlash: false,
  env: {
    // 🛡️ Sentinel: Removed sensitive SMTP credentials from here.
    // They are available in API routes via process.env automatically.
    // Exposing them here would leak them to the client bundle.
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "8n7i6e6csz1uq1hg.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
