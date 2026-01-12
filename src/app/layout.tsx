import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";
import { ThemeProvider, AuthProvider, LanguageProvider, SolidModeProvider } from "@/contexts";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Obour Academic Hub",
  description: "A comprehensive academic platform for Obour Institutes students",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://obour-hub.vercel.app"),
  icons: {
    icon: "/obour-logo.png",
    shortcut: "/obour-logo.png",
    apple: "/obour-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

// ... (existing imports)

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
                <SolidModeProvider>
                  <AuthenticatedLayout>{children}</AuthenticatedLayout>
                  <Toaster
                    position="top-center"
                    toastOptions={{
                      classNames: {
                        toast:
                          "bg-card/90 dark:bg-card/90 backdrop-blur-xl backdrop-saturate-150 border border-border shadow-lg text-foreground",
                        title: "text-foreground font-medium",
                        description: "text-muted-foreground",
                        actionButton: "bg-primary text-primary-foreground",
                        cancelButton: "bg-muted text-muted-foreground",
                      },
                    }}
                  />
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
