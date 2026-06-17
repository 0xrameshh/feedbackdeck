import { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://feedbackstar.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/", "/admin/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
