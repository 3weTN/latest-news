import { fetchPosts } from "@/actions/fetch-posts";
import { MetadataRoute } from "next";

/**
 * Generate a sitemap compatible with Next.js MetadataRoute.Sitemap.
 * Only `url` and optional `lastModified` are returned to satisfy the type.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages (only include fields supported by Next's Sitemap type)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: "https://mosaiquefm.net",
      lastModified: new Date(),
    },
  ];

  // Fetch first 4 pages of articles (adjust pages if you want more)
  const allArticles: Array<any> = [];
  for (let page = 1; page <= 4; page++) {
    const posts = await fetchPosts(page);
    if (posts) {
      allArticles.push(...posts);
    }
  }

  const articleLastModified = (rawDate: unknown): Date | undefined => {
    if (!rawDate) {
      return undefined;
    }

    const safeParse = (value: string | number | Date): Date | undefined => {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    };

    const parsed =
      rawDate instanceof Date
        ? safeParse(rawDate)
        : typeof rawDate === "number"
        ? safeParse(rawDate)
        : typeof rawDate === "string"
        ? safeParse(rawDate)
        : undefined;

    if (parsed) {
      return parsed;
    }

    if (typeof rawDate === "string") {
      const normalized = rawDate.replace(" ", "T");
      const normalizedParsed = safeParse(normalized);
      if (normalizedParsed) {
        return normalizedParsed;
      }
    }

    return undefined;
  };

  // Create article entries using only the allowed sitemap fields
  const articles: MetadataRoute.Sitemap = allArticles.map((article) => {
    const entry: MetadataRoute.Sitemap[number] = {
      url: `https://mosaiquefm.net/article/${article.slug || article.id}`,
    };

    const lastModified = articleLastModified(article.startPublish);
    if (lastModified) {
      entry.lastModified = lastModified;
    }

    return entry;
  });

  return [...staticPages, ...articles];
}
