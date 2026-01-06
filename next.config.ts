import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Disabled to support API Routes (AI Chat & Blob Upload)
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "8n7i6e6csz1uq1hg.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
