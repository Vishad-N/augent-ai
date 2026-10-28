import type { MetadataRoute } from "next";
import { legalDocs, siteUrl, updatedIso } from "@/data/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    ...legalDocs.map((d) => ({
      url: `${siteUrl}/${d.slug}`,
      lastModified: updatedIso,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
