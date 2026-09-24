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
  ...(!isFirebaseBuild && {
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "X-XSS-Protection", value: "1; mode=block" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            {
              key: "Permissions-Policy",
              value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
            },
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
            {
              key: "Content-Security-Policy",
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.firebaseio.com https://*.firebasedatabase.app https://*.googleapis.com https://apis.google.com https://accounts.google.com https://*.gstatic.com https://www.gstatic.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://www.googletagmanager.com https://www.google-analytics.com https://*.vercel.live https://vercel.live https://vercel.com",
                "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebasedatabase.app wss://*.firebasedatabase.app https://res.cloudinary.com https://*.gstatic.com https://www.gstatic.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://obour-academic-hub.vercel.app https://obourinstitutes.web.app https://obourinstitutes.firebaseapp.com https://obourinstitutes1.web.app https://obourinstitutes1.firebaseapp.com https://*.web.app https://*.firebaseapp.com https://www.google-analytics.com https://www.googletagmanager.com https://accounts.google.com https://securetoken.googleapis.com wss://*.pusher.com https://*.pusher.com https://*.vercel.live https://vercel.live https://vercel.com",
                "img-src 'self' data: blob: https://res.cloudinary.com https://ui-avatars.com https://*.googleusercontent.com https://8n7i6e6csz1uq1hg.public.blob.vercel-storage.com https://firebasestorage.googleapis.com https://vercel.com https://*.vercel.com https://vercel.live https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.googletagmanager.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com https://*.vercel.live https://vercel.live https://assets.vercel.com",
                "frame-src 'self' https://*.firebaseapp.com https://*.firebase.com https://*.firebaseio.com https://accounts.google.com https://*.vercel.live https://vercel.live https://*.vercel.com",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'self' https://*.vercel.live https://vercel.live https://*.vercel.app https://*.vercel.com",
              ].join("; "),
            },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;
