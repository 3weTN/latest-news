"use server";
import { Article } from "@/types";

export type ArticleDetailResult = {
  article: Article | null;
  attemptedUrls: string[];
};

const FETCH_OPTIONS = {
  next: {
    revalidate: 300,
  },
} as const;

export async function fetchPosts(page: number) {
  const perPage = 24;
  const apiUrl = `https://api.mosaiquefm.net/api/ar/${perPage}/${page}/articles`;

  try {
    const response = await fetch(apiUrl, FETCH_OPTIONS);
    const data = await response.json();
    return data?.items as Article[];
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export async function fetchArticleBySlug(
  slug: string
): Promise<ArticleDetailResult> {
  const attemptedUrls: string[] = [];
  // If slug looks like a numeric id, call the article detail endpoint pattern.
  const isNumeric = /^\d+$/.test(slug);

  if (isNumeric) {
    // Try multiple language endpoints following the API pattern.
    const langs = ["ar", "fr"];
    for (const lang of langs) {
      const detailUrl = `https://api.mosaiquefm.net/api/${lang}/5/1/articles/${encodeURIComponent(
        slug
      )}`;
      attemptedUrls.push(detailUrl);
      try {
        console.log("Fetching article detail from", detailUrl);
        const res = await fetch(detailUrl, FETCH_OPTIONS);
        if (!res.ok) continue;
        const data = await res.json();
        const article: any = data?.item ?? data?.article ?? data?.data ?? data;
        if (article) return { article: article as Article, attemptedUrls };
      } catch (e) {
        // try next language
        continue;
      }
    }
  }

  // Fallback: search recent posts (paginated) to find a matching slug or id.
  try {
    const decoded = decodeURIComponent(slug);
    const maxPages = 8;
    for (let p = 1; p <= maxPages; p++) {
      const posts = await fetchPosts(p);
      if (!posts || posts.length === 0) continue;
      const found = posts.find(
        (it) =>
          it.slug === decoded ||
          it.tslug === decoded ||
          String(it.id) === decoded ||
          String(it.id) === slug
      );
      if (found) return { article: found, attemptedUrls };
    }

    console.log("Article not found for slug:", slug);

    return { article: null, attemptedUrls };
  } catch (e) {
    return { article: null, attemptedUrls };
  }
}
