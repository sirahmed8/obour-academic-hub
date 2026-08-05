import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider, AuthProvider, LanguageProvider, SolidModeProvider } from "@/contexts";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Obour Academic Hub",
    template: "%s | Obour Academic Hub",
  },
  description:
    "The premium academic companion for Obour Institutes students. Access resources, AI tutoring, and productivity tools in one unified, high-performance platform.",
  keywords: [
    "Obour Institutes",
    "Academic Hub",
    "Student Portal",
    "AI Education",
    "Study Resources",
    "Egypt Higher Education",
    "Obour City",
    "Engineering Resources",
    "Management Resources",
  ],
  authors: [{ name: "Ahmed", url: "https://github.com/sirahmed8" }],
  creator: "Ahmed",
  publisher: "Obour Academic Hub",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://obour-academic-hub.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Obour Academic Hub",
    description: "The premium academic companion for Obour Institutes students.",
    url: "https://obour-academic-hub.vercel.app",
    siteName: "Obour Academic Hub",
    images: [
      {
        url: "/obour-logo.png",
        width: 1200,
        height: 630,
        alt: "Obour Academic Hub Preview",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Obour Academic Hub",
    description: "Transform your academic journey with AI-powered tools and curated resources.",
    images: ["/obour-logo.png"],
  },
  icons: {
    icon: "/obour-logo.png",
    shortcut: "/obour-logo.png",
    apple: "/obour-logo.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zooming up to 5x for accessibility
  userScalable: true, // Enable user scaling for WCAG compliance
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  if (typeof args[0] === 'string' && args[0].includes('The width(-1) and height(-1)')) return;
                  originalWarn.apply(console, args);
                };
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        <link
          rel="preconnect"
          href="https://identitytoolkit.googleapis.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <NextTopLoader
          color="hsl(var(--primary))"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
        />
        <ErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <SolidModeProvider>
                  <AuthenticatedLayout>{children}</AuthenticatedLayout>
                  <Toaster
                    position="top-center"
                    toastOptions={{
                      classNames: {
                        toast:
                          "group toast glass-premium rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-2xl text-foreground",
                        title: "text-foreground font-bold text-sm",
                        description: "text-muted-foreground text-xs font-medium",
                        actionButton:
                          "bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform",
                        cancelButton:
                          "bg-muted text-muted-foreground font-bold hover:bg-muted/80 transition-colors",
                      },
                    }}
                  />
                  <SpeedInsights />
                  <Analytics />
                </SolidModeProvider>
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
