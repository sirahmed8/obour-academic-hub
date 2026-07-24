import type { NextConfig } from "next";

const isFirebaseBuild = process.env.FIREBASE_BUILD === "1";

const nextConfig: NextConfig = {
  // Static export for Firebase Hosting, SSR for Vercel
  ...(isFirebaseBuild && { output: "export" }),
  // Filter out .ts and .js files from route discovery during static export
  // to avoid conflicts with dynamic API routes. UI pages use .tsx.
  pageExtensions: isFirebaseBuild ? ["tsx", "jsx", "mdx"] : ["tsx", "ts", "jsx", "js", "mdx"],
  trailingSlash: isFirebaseBuild ? true : false,
  serverExternalPackages: [
    "firebase-admin",
    "@google-cloud/firestore",
    "@google-cloud/storage",
    "@grpc/grpc-js",
    "protobufjs",
  ],
  images: {
    unoptimized: isFirebaseBuild,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "8n7i6e6csz1uq1hg.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
    webpackBuildWorker: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
