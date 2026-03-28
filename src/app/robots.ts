import type { MetadataRoute } from "next";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  "https://hepaima.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/me",
          "/quiz",
          "/result",
          "/ready",
          "/history",
          "/contact",
          "/terms",
          "/privacy",
        ],
        disallow: ["/admin", "/admin/*", "/api", "/api/*"],
      },
    ],
    sitemap: `${APP_URL.replace(/\/+$/, "")}/sitemap.xml`,
    host: APP_URL.replace(/\/+$/, ""),
  };
}

