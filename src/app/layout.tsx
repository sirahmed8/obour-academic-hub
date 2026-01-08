import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, AuthProvider, LanguageProvider } from "@/contexts";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  // Note: maximumScale removed to allow user zooming (WCAG 2.1 accessibility)
};

export const metadata: Metadata = {
  metadataBase: new URL("https://obourinstitutes.web.app"),
  title: "Obour Academic Hub | معاهد العبور",
  description: "Smart Learning Management System - نظام إدارة التعلم الذكي",
  manifest: "/manifest.json",
  icons: {
    icon: "/obour-logo.png",
    shortcut: "/obour-logo.png",
    apple: "/obour-logo.png",
  },
  appleWebApp: {
    capable: true,
    title: "Obour Hub",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Obour Academic Hub",
    description: "Smart Learning Management System",
    url: "https://obourinstitutes.web.app",
    siteName: "Obour Academic Hub",
    images: [{ url: "/obour-logo.png", width: 1200, height: 630 }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Obour Academic Hub",
    description: "Smart Learning Management System",
    images: ["/obour-logo.png"],
  },
};

import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                {children}
                <Toaster
                  position="top-center"
                  toastOptions={{
                    classNames: {
                      toast:
                        "bg-white/10 dark:bg-black/10 backdrop-blur-xl backdrop-saturate-150 border border-white/20 dark:border-white/10 shadow-lg !text-foreground",
                      title: "text-foreground",
                      description: "text-muted-foreground",
                      actionButton: "bg-primary text-primary-foreground",
                      cancelButton: "bg-muted text-muted-foreground",
                    },
                  }}
                />
                <Analytics />
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
