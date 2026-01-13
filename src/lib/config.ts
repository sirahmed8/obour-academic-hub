export const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    // If we are on Vercel (or localhost), use relative path
    if (
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("localhost")
    ) {
      return "";
    }
    // If we are on Firebase (or any other domain), point to Vercel
    // We assume the Vercel app name matches the repo or project structure
    // If this is incorrect, the user will need to update it.
    return "https://obour-academic-hub.vercel.app";
  }
  return "";
};
