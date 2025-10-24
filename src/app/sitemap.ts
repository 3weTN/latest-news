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

  // Create article entries using only the allowed sitemap fields
  const articles: MetadataRoute.Sitemap = allArticles.map((article) => {
    const lastMod = article.startPublish
      ? new Date(article.startPublish)
      : new Date();

    return {
      url: `https://mosaiquefm.net/article/${article.slug || article.id}`,
      lastModified: lastMod,
    };
  });

  return [...staticPages, ...articles];
}
