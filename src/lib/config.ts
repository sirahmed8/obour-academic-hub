export const getApiBaseUrl = () => {
  const explicitBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();

    // Local development
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      return "";
    }

    // Vercel instances should use same-origin API
    if (host.includes("vercel.app")) {
      return "";
    }

    // Firebase Hosting domain should point to Vercel API endpoint
    if (
      host.includes("obourinstitutes.web.app") ||
      host.includes("obourinstitutes.firebaseapp.com")
    ) {
      return "https://obour-academic-hub.vercel.app";
    }

    // Unknown host: default to same-origin as best effort
    return "";
  }

  // SSR / build: prefer explicit endpoint or empty relative path
  return "";
};
