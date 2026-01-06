import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider, AuthProvider, LanguageProvider } from "@/contexts";
import { Toaster } from "sonner";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
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
      <body className={`${geist.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                {children}
                <Toaster position="top-center" richColors />
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
