import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://obourinstitutes1.web.app";

  // Comprehensive platform public & legal routes
  const routes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/main`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    {
      url: `${baseUrl}/subject`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/schedule`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    { url: `${baseUrl}/exams`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    { url: `${baseUrl}/qa`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    {
      url: `${baseUrl}/showcase`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/alumni`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    { url: `${baseUrl}/market`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    {
      url: `${baseUrl}/guide`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${baseUrl}/plus`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/refunds`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return routes;
}
