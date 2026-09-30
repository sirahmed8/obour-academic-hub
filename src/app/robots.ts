import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/private/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://obourinstitutes1.web.app"}/sitemap.xml`,
  };
}
